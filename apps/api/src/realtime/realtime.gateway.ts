import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { EventsService } from '../events/events.service';
import { ParticipantService } from '../participants/participant.service';
import { RedisService } from './redis.service';
import { ClientEvents, ServerEvents, rooms } from '@iep/types';
import { ActivityService } from '../activities/activity.service';
import { ResponseService } from '../responses/response.service';

type JoinPayload = {
  eventCode: string;
  anonId: string;
  displayName?: string;
};

type ObservePayload = {
  eventCode: string;
};

/** Per-socket bookkeeping so disconnect can clean up the right event. */
type SocketState =
  | { role: 'participant'; eventId: string; anonId: string }
  | { role: 'observer'; eventId: string };

// ── Throttle map: activityId → pending broadcast timeout ─────────────────────
// Limits poll:results broadcasts to ≤4/sec per activity (250ms debounce).
const pollBroadcastTimers = new Map<string, NodeJS.Timeout>();

@WebSocketGateway({ cors: true })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  /**
   * Tracks which event each socket belongs to (and whether it's a counted
   * participant or a read-only observer) so handleDisconnect can reconcile
   * the live count without trusting the client.
   */
  private readonly socketState = new Map<string, SocketState>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly participantService: ParticipantService,
    private readonly redisService: RedisService,
    private readonly activityService: ActivityService,
    private readonly responseService: ResponseService,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.logger.log('RealtimeGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.debug(`Client disconnected: ${client.id}`);

    const state = this.socketState.get(client.id);
    if (!state) {
      return;
    }
    this.socketState.delete(client.id);

    // Observers are never counted, so there is nothing to reconcile.
    if (state.role === 'observer') {
      return;
    }

    const { eventId, anonId } = state;

    // Decrement this anonId's socket ref-count; only mark the participant
    // offline (and drop them from the live set) once their LAST socket closes.
    const remaining = await this.decrementConnection(eventId, anonId);
    if (remaining <= 0) {
      await this.participantService.markDisconnected(eventId, anonId);
    }

    await this.broadcastCount(eventId);

    this.logger.log(
      `Participant left event=${eventId} anonId=${anonId} (sockets left for anonId=${Math.max(0, remaining)})`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 2 — Join / Observe
  // ═══════════════════════════════════════════════════════════════════════════

  @SubscribeMessage(ClientEvents.EVENT_JOIN)
  async handleEventJoin(
    @MessageBody() payload: JoinPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { eventCode, anonId, displayName } = payload ?? {};

    if (!eventCode || !anonId) {
      client.emit(ServerEvents.ERROR, {
        message: 'A valid event code is required to join.',
      });
      return;
    }

    const event = await this.resolveJoinableEvent(eventCode, client);
    if (!event) {
      return;
    }

    const eventId = event._id.toString();

    await this.participantService.upsertParticipant(eventId, anonId, displayName);

    this.socketState.set(client.id, { role: 'participant', eventId, anonId });
    await client.join(rooms.event(eventId));

    await this.incrementConnection(eventId, anonId);
    await this.broadcastCount(eventId);

    // Enrich snapshot with current tally if a poll is live
    const snapshot = await this.buildSnapshot(event);
    client.emit(ServerEvents.SESSION_SNAPSHOT, snapshot);

    this.logger.log(
      `Participant joined event=${event.eventCode} anonId=${anonId}`,
    );
  }

  @SubscribeMessage(ClientEvents.EVENT_OBSERVE)
  async handleEventObserve(
    @MessageBody() payload: ObservePayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { eventCode } = payload ?? {};

    if (!eventCode) {
      client.emit(ServerEvents.ERROR, {
        message: 'A valid event code is required to observe.',
      });
      return;
    }

    const event = await this.resolveJoinableEvent(eventCode, client);
    if (!event) {
      return;
    }

    const eventId = event._id.toString();

    // Observers (host dashboard, projector) join the rooms to receive
    // broadcasts but are NOT registered or counted as participants.
    this.socketState.set(client.id, { role: 'observer', eventId });
    await client.join(rooms.event(eventId));
    await client.join(rooms.host(eventId));

    // Send the current count + snapshot straight to the observer so it renders
    // immediately instead of waiting for the next participant change.
    client.emit(ServerEvents.PARTICIPANT_COUNT, {
      count: await this.getCount(eventId),
    });

    const snapshot = await this.buildSnapshot(event);
    client.emit(ServerEvents.SESSION_SNAPSHOT, snapshot);

    this.logger.log(`Observer joined event=${event.eventCode}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 3 — Activity launch / close / respond
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * activity:launch  { activityId }  — emitted by host client
   *
   * 1. Close any currently live activity for the same event.
   * 2. Set the new activity to 'live' + update event.activeActivityId.
   * 3. Broadcast activity:launched to everyone in the event room.
   */
  @SubscribeMessage(ClientEvents.ACTIVITY_LAUNCH)
  async handleActivityLaunch(
    @MessageBody() payload: { activityId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { activityId } = payload ?? {};

    if (!activityId) {
      client.emit(ServerEvents.ERROR, { message: 'activityId is required.' });
      return;
    }

    let activity: any;
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    const eventId = activity.eventId.toString();

    // Close any previously live activity and notify the room
    const closed = await this.activityService.closeLiveActivity(eventId);
    if (closed) {
      this.server
        .to(rooms.event(eventId))
        .emit(ServerEvents.ACTIVITY_CLOSED, {
          activityId: closed._id.toString(),
        });
    }

    // Set the new activity live and persist on the event
    const liveActivity = await this.activityService.setStatus(activityId, 'live');
    await this.eventsService.setActiveActivity(eventId, activityId);

    this.server
      .to(rooms.event(eventId))
      .emit(ServerEvents.ACTIVITY_LAUNCHED, { activity: liveActivity });

    this.logger.log(`activity:launched activityId=${activityId} eventId=${eventId}`);
  }

  /**
   * activity:close  { activityId }  — emitted by host client
   *
   * Sets status = 'closed', clears event.activeActivityId,
   * cancels any pending throttled broadcast, and notifies the room.
   */
  @SubscribeMessage(ClientEvents.ACTIVITY_CLOSE)
  async handleActivityClose(
    @MessageBody() payload: { activityId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { activityId } = payload ?? {};

    if (!activityId) {
      client.emit(ServerEvents.ERROR, { message: 'activityId is required.' });
      return;
    }

    let activity: any;
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    const eventId = activity.eventId.toString();

    await this.activityService.setStatus(activityId, 'closed');
    await this.eventsService.setActiveActivity(eventId, null);

    // Cancel any pending throttled poll:results broadcast for this activity
    const timer = pollBroadcastTimers.get(activityId);
    if (timer) {
      clearTimeout(timer);
      pollBroadcastTimers.delete(activityId);
    }

    this.server
      .to(rooms.event(eventId))
      .emit(ServerEvents.ACTIVITY_CLOSED, { activityId });

    this.logger.log(`activity:closed activityId=${activityId} eventId=${eventId}`);
  }

  /**
   * activity:respond  { activityId, anonId, selectedOptionIds?, textValue?, ratingValue? }
   * — emitted by participant client
   *
   * 1. Validate the activity is live.
   * 2. Persist the response (ResponseService enforces duplicate-vote rules).
   * 3. Acknowledge to the submitting client.
   * 4. Schedule a throttled poll:results broadcast (≤4/sec per activity).
   */
  @SubscribeMessage(ClientEvents.ACTIVITY_RESPOND)
  async handleActivityRespond(
    @MessageBody()
    payload: {
      activityId: string;
      anonId: string;
      selectedOptionIds?: string[];
      textValue?: string;
      ratingValue?: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { activityId, anonId, selectedOptionIds, textValue, ratingValue } =
      payload ?? {};

    if (!activityId || !anonId) {
      client.emit(ServerEvents.ERROR, {
        message: 'activityId and anonId are required.',
      });
      return;
    }

    let activity: any;
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    if (activity.status !== 'live') {
      client.emit(ServerEvents.ERROR, { message: 'This activity is not live.' });
      return;
    }

    const eventId = activity.eventId.toString();

    try {
      await this.responseService.saveResponse(activity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        selectedOptionIds,
        textValue,
        ratingValue,
      });
    } catch (err: any) {
      client.emit(ServerEvents.ERROR, {
        message: err.message ?? 'Could not save response.',
      });
      return;
    }

    // Acknowledge to the submitting client immediately
    client.emit(ServerEvents.ACTIVITY_RESPONDED, { activityId });

    // Throttled broadcast of poll:results to the room (250ms debounce = ≤4/sec)
    this.schedulePollResultsBroadcast(activityId, eventId, activity);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Private helpers
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Looks up an event by code and validates it can be joined. Emits a friendly
   * error to the client and returns null when the code is invalid or ended.
   */
  private async resolveJoinableEvent(eventCode: string, client: Socket) {
    const event = await this.eventsService.findByEventCode(eventCode);

    if (!event) {
      client.emit(ServerEvents.ERROR, {
        message: 'That event code does not exist. Check the code and try again.',
      });
      return null;
    }

    if (event.status === 'ended') {
      client.emit(ServerEvents.ERROR, {
        message: 'This event has already ended.',
      });
      return null;
    }

    return event;
  }

  /**
   * Snapshot sent on join/observe so late joiners and reconnecting clients
   * re-sync. Now includes the active activity document and its current tally
   * so participants who join mid-poll see results immediately.
   */
  private async buildSnapshot(event: {
    activeActivityId: unknown;
    _id: unknown;
  }) {
    const eventId = (event as any)._id.toString();
    let activeActivity: any = null;
    let currentTally: any = null;

    if (event.activeActivityId) {
      try {
        activeActivity = await this.activityService.findById(
          event.activeActivityId.toString(),
        );

        // Include current tally in snapshot so late joiners see live results
        if (activeActivity?.config && (activeActivity.config as any).pollType) {
          currentTally = await this.responseService.computeTally(
            activeActivity._id.toString(),
            activeActivity,
          );
        }
      } catch {
        // Active activity may have been deleted — degrade gracefully
        activeActivity = null;
      }
    }

    return {
      activeActivityId: event.activeActivityId
        ? event.activeActivityId.toString()
        : null,
      activeActivity,
      currentTally,
      approvedQuestions: [] as unknown[],
    };
  }

  /**
   * Debounced poll:results broadcast.
   * Resets the 250ms timer on every new response so bursts are batched,
   * delivering at most ~4 broadcasts per second per activity.
   */
  private schedulePollResultsBroadcast(
    activityId: string,
    eventId: string,
    activity: any,
  ): void {
    const existing = pollBroadcastTimers.get(activityId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      pollBroadcastTimers.delete(activityId);
      try {
        const tallies = await this.responseService.computeTally(
          activityId,
          activity,
        );
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.POLL_RESULTS, { activityId, tallies });
      } catch (err) {
        this.logger.error(
          `Failed to broadcast poll:results for activityId=${activityId}`,
          err,
        );
      }
    }, 250);

    pollBroadcastTimers.set(activityId, timer);
  }

  /** Redis hash: field = anonId, value = number of live sockets for it. */
  private connectionsKey(eventId: string): string {
    return `event:${eventId}:connections`;
  }

  private async incrementConnection(
    eventId: string,
    anonId: string,
  ): Promise<void> {
    await this.redisService.client.hincrby(
      this.connectionsKey(eventId),
      anonId,
      1,
    );
  }

  private async decrementConnection(
    eventId: string,
    anonId: string,
  ): Promise<number> {
    const key = this.connectionsKey(eventId);
    const remaining = await this.redisService.client.hincrby(key, anonId, -1);
    if (remaining <= 0) {
      await this.redisService.client.hdel(key, anonId);
    }
    return remaining;
  }

  /** Distinct connected participants = number of anonId fields in the hash. */
  private async getCount(eventId: string): Promise<number> {
    return this.redisService.client.hlen(this.connectionsKey(eventId));
  }

  private async broadcastCount(eventId: string): Promise<void> {
    const count = await this.getCount(eventId);
    this.server
      .to(rooms.event(eventId))
      .emit(ServerEvents.PARTICIPANT_COUNT, { count });
  }
}