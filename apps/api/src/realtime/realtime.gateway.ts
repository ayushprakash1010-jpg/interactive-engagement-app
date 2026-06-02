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

    client.emit(ServerEvents.SESSION_SNAPSHOT, this.buildSnapshot(event));

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
    client.emit(ServerEvents.SESSION_SNAPSHOT, this.buildSnapshot(event));

    this.logger.log(`Observer joined event=${event.eventCode}`);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

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
   * re-sync. Activities/questions hydrate in later sprints; for now we surface
   * the active activity reference and an empty approved-questions list.
   */
  private buildSnapshot(event: { activeActivityId: unknown }) {
    return {
      activeActivityId: event.activeActivityId
        ? event.activeActivityId.toString()
        : null,
      approvedQuestions: [] as unknown[],
    };
  }

  /** Redis hash: field = anonId, value = number of live sockets for it. */
  private connectionsKey(eventId: string): string {
    return `event:${eventId}:connections`;
  }

  private async incrementConnection(
    eventId: string,
    anonId: string,
  ): Promise<void> {
    await this.redisService.client.hincrby(this.connectionsKey(eventId), anonId, 1);
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

