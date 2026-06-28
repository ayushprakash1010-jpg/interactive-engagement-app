import { Logger, type OnApplicationShutdown } from '@nestjs/common';
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
import type { ZodSchema } from 'zod';

import { EventsService } from '../events/events.service';
import { ParticipantService } from '../participants/participant.service';
import { RedisService } from './redis.service';
import { RateLimitService } from './rate-limit.service';
import {
  ClientEvents,
  ServerEvents,
  rooms,
  eventJoinSchema,
  eventObserveSchema,
  activityIdSchema,
  activityRespondSocketSchema,
  wordCloudSubmitSchema,
  quizAnswerSchema,
  qaAskSchema,
  qaUpvoteSchema,
  qaModerateSchema,
  qaReplySchema,
  sessionEndSchema,
} from '@iep/types';
import { ActivityService } from '../activities/activity.service';
import type { ActivityDocument } from '../activities/activity.schema';
import type { PollTally } from '../activities/utils/tally.util';
import { ResponseService } from '../responses/response.service';
import { QuestionsService } from '../questions/questions.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  QuizConfig,
  getQuizQuestion,
  sanitizeQuizQuestionForBroadcast,
} from '../activities/utils/quiz.util';

type JoinPayload = {
  eventCode: string;
  anonId: string;
  displayName?: string;
};

type ObservePayload = {
  eventCode: string;
};

type SocketState =
  | { role: 'participant'; eventId: string; anonId: string }
  | { role: 'observer'; eventId: string };

type QuizRuntimeState = {
  activityId: string;
  eventId: string;
  questionId: string;
  questionIndex: number;
  endsAt: number;
  timeout: NodeJS.Timeout | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isQuizConfig(value: unknown): value is QuizConfig {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value.questions);
}

const pollBroadcastTimers = new Map<string, NodeJS.Timeout>();
const wordCloudBroadcastTimers = new Map<string, NodeJS.Timeout>();
const quizRuntimeByActivityId = new Map<string, QuizRuntimeState>();
const quizAdvanceLocks = new Set<string>();
const pollRuntimeByActivityId = new Map<string, { endsAt: number; timeout: NodeJS.Timeout }>();

@WebSocketGateway({ cors: true })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnApplicationShutdown {
  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly socketState = new Map<string, SocketState>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly participantService: ParticipantService,
    private readonly redisService: RedisService,
    private readonly activityService: ActivityService,
    private readonly responseService: ResponseService,
    private readonly questionsService: QuestionsService,
    private readonly analyticsService: AnalyticsService,
    private readonly rateLimitService: RateLimitService,
  ) { }

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.logger.log('RealtimeGateway initialized');
  }

  private parsePayload<T>(schema: ZodSchema<T>, payload: unknown, client: Socket): T | null {
    const result = schema.safeParse(payload);
    if (!result.success) {
      this.logger.warn(
        `Invalid socket payload: ${result.error.issues
          .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('; ')}`,
      );
      client.emit(ServerEvents.ERROR, {
        message: 'Invalid request. Please refresh and try again.',
      });
      return null;
    }
    return result.data;
  }

  private clientIp(client: Socket): string | undefined {
    const forwarded = client.handshake?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim();
    }
    return client.handshake?.address;
  }

  private async enforceRateLimit(action: string, anonId: string, client: Socket): Promise<boolean> {
    const result = await this.rateLimitService.consumeForAction(
      action,
      anonId,
      this.clientIp(client),
    );
    if (!result.allowed) {
      client.emit(ServerEvents.ERROR, {
        message: `You're doing that too fast. Try again in ${result.retryAfter}s.`,
      });
      return false;
    }
    return true;
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log(`Draining sockets on shutdown (signal=${signal ?? 'n/a'})`);

    for (const timer of pollBroadcastTimers.values()) clearTimeout(timer);
    pollBroadcastTimers.clear();
    for (const timer of wordCloudBroadcastTimers.values()) clearTimeout(timer);
    wordCloudBroadcastTimers.clear();
    for (const runtime of quizRuntimeByActivityId.values()) {
      if (runtime.timeout) clearTimeout(runtime.timeout);
    }
    quizRuntimeByActivityId.clear();
    quizAdvanceLocks.clear();

    try {
      this.server?.disconnectSockets(true);
      await new Promise<void>((resolve) => {
        if (!this.server) return resolve();
        this.server.close(() => resolve());
      });
    } catch (err) {
      this.logger.error(
        `Error closing Socket.IO server: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
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

    if (state.role === 'observer') {
      return;
    }

    const { eventId, anonId } = state;

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
    const data = this.parsePayload(eventJoinSchema, payload, client);
    if (!data) return;
    const { eventCode, anonId, displayName } = data;

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

    const snapshot = await this.buildSnapshot(event, 'participant');
    client.emit(ServerEvents.SESSION_SNAPSHOT, snapshot);

    this.logger.log(`Participant joined event=${event.eventCode} anonId=${anonId}`);
  }

  @SubscribeMessage(ClientEvents.EVENT_OBSERVE)
  async handleEventObserve(
    @MessageBody() payload: ObservePayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(eventObserveSchema, payload, client);
    if (!data) return;
    const { eventCode } = data;

    const event = await this.resolveJoinableEvent(eventCode, client);
    if (!event) {
      return;
    }

    const eventId = event._id.toString();

    this.socketState.set(client.id, { role: 'observer', eventId });
    await client.join(rooms.event(eventId));
    await client.join(rooms.host(eventId));

    client.emit(ServerEvents.PARTICIPANT_COUNT, {
      count: await this.getCount(eventId),
    });

    // Observers get full snapshot including pending questions.
    const snapshot = await this.buildSnapshot(event, 'observer');
    client.emit(ServerEvents.SESSION_SNAPSHOT, snapshot);

    this.logger.log(`Observer joined event=${event.eventCode}`);
  }

  @SubscribeMessage(ClientEvents.ACTIVITY_LAUNCH)
  async handleActivityLaunch(
    @MessageBody() payload: { activityId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(activityIdSchema, payload, client);
    if (!data) return;
    const { activityId } = data;

    let activity: any;
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    const eventId = activity.eventId.toString();

    const closed = await this.activityService.closeLiveActivity(eventId);
    if (closed) {
      const closedId = closed._id.toString();
      this.clearQuizRuntime(closedId);

      const pRuntime = pollRuntimeByActivityId.get(closedId);
      if (pRuntime?.timeout) clearTimeout(pRuntime.timeout);
      pollRuntimeByActivityId.delete(closedId);

      const pollTimer = pollBroadcastTimers.get(closedId);
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollBroadcastTimers.delete(closedId);
      }

      const wordCloudTimer = wordCloudBroadcastTimers.get(closedId);
      if (wordCloudTimer) {
        clearTimeout(wordCloudTimer);
        wordCloudBroadcastTimers.delete(closedId);
      }

      this.server.to(rooms.event(eventId)).emit(ServerEvents.ACTIVITY_CLOSED, {
        activityId: closedId,
      });
    }

    const liveActivity = await this.activityService.setStatus(activityId, 'live');
    await this.eventsService.setActiveActivity(eventId, activityId);

    let endsAt: number | undefined = undefined;

    const rawActivity = typeof activity.toJSON === 'function' ? activity.toJSON() : activity;
    const config: any = rawActivity.config || {};
    const sec = Number(config.timeLimitSec);

    this.logger.debug(`Found config.timeLimitSec = ${config.timeLimitSec}, parsed sec = ${sec}`);

    if (
      (rawActivity.type === 'poll' ||
        rawActivity.type === 'feedback' ||
        rawActivity.type === 'wordcloud') &&
      !isNaN(sec) &&
      sec > 0
    ) {
      endsAt = Date.now() + sec * 1000;

      const timeout = setTimeout(async () => {
        pollRuntimeByActivityId.delete(activityId);
        await this.activityService.setStatus(activityId, 'closed');
        await this.eventsService.setActiveActivity(eventId, null);

        const bTimer = pollBroadcastTimers.get(activityId);
        if (bTimer) {
          clearTimeout(bTimer);
          pollBroadcastTimers.delete(activityId);
        }

        this.server.to(rooms.event(eventId)).emit(ServerEvents.ACTIVITY_CLOSED, { activityId });
      }, sec * 1000);

      pollRuntimeByActivityId.set(activityId, { endsAt, timeout });
    }

    this.server
      .to(rooms.event(eventId))
      .emit(ServerEvents.ACTIVITY_LAUNCHED, { activity: liveActivity, endsAt });

    this.logger.log(
      `activity:launched activityId=${activityId} eventId=${eventId} endsAt=${endsAt}`,
    );

    if (rawActivity.type === 'quiz') {
      setTimeout(() => {
        void this.advanceQuizQuestion(activityId);
      }, 300);
    }
  }

  @SubscribeMessage(ClientEvents.ACTIVITY_CLOSE)
  async handleActivityClose(
    @MessageBody() payload: { activityId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(activityIdSchema, payload, client);
    if (!data) return;
    const { activityId } = data;

    let activity: { eventId: { toString(): string } };
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    const eventId = activity.eventId.toString();

    await this.activityService.setStatus(activityId, 'closed');
    await this.eventsService.setActiveActivity(eventId, null);

    const pollTimer = pollBroadcastTimers.get(activityId);
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollBroadcastTimers.delete(activityId);
    }

    const wordCloudTimer = wordCloudBroadcastTimers.get(activityId);
    if (wordCloudTimer) {
      clearTimeout(wordCloudTimer);
      wordCloudBroadcastTimers.delete(activityId);
    }

    const pRuntime = pollRuntimeByActivityId.get(activityId);
    if (pRuntime?.timeout) clearTimeout(pRuntime.timeout);
    pollRuntimeByActivityId.delete(activityId);

    this.clearQuizRuntime(activityId);

    this.server.to(rooms.event(eventId)).emit(ServerEvents.ACTIVITY_CLOSED, { activityId });

    this.logger.log(`activity:closed activityId=${activityId} eventId=${eventId}`);
  }

  @SubscribeMessage(ClientEvents.ACTIVITY_RESPOND)
  async handleActivityRespond(
    @MessageBody()
    payload: {
      activityId: string;
      anonId: string;
      selectedOptionIds?: string[];
      textValue?: string;
      ratingValue?: number;
      feedbackAnswers?: Array<{
        fieldId: string;
        type: 'rating' | 'text';
        ratingValue?: number;
        textValue?: string;
      }>;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(activityRespondSocketSchema, payload, client);
    if (!data) return;
    const { activityId, anonId, selectedOptionIds, textValue, ratingValue, feedbackAnswers } = data;

    if (!(await this.enforceRateLimit('activity:respond', anonId, client))) {
      return;
    }

    let activity: ActivityDocument;
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
      if (activity.type === 'poll') {
        await this.responseService.saveResponse(activity, {
          activityId,
          eventId,
          participantAnonId: anonId,
          selectedOptionIds,
          textValue,
          ratingValue,
        });

        await this.analyticsService.invalidateCacheIfLive(eventId);

        client.emit(ServerEvents.ACTIVITY_RESPONDED, { activityId });
        this.schedulePollResultsBroadcast(activityId, eventId, activity);
        return;
      }

      if (activity.type === 'feedback') {
        await this.responseService.saveFeedbackResponse(activity, {
          activityId,
          eventId,
          participantAnonId: anonId,
          feedbackAnswers,
        });

        await this.analyticsService.invalidateCacheIfLive(eventId);

        client.emit(ServerEvents.ACTIVITY_RESPONDED, { activityId });
        return;
      }

      client.emit(ServerEvents.ERROR, {
        message: 'activity:respond is only supported for poll and feedback activities.',
      });
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string' ? err.message : 'Could not save response.';

      client.emit(ServerEvents.ERROR, { message });
    }
  }

  @SubscribeMessage(ClientEvents.WORDCLOUD_SUBMIT)
  async handleWordCloudSubmit(
    @MessageBody()
    payload: {
      activityId: string;
      anonId: string;
      words?: string[];
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(wordCloudSubmitSchema, payload, client);
    if (!data) return;
    const { activityId, anonId, words } = data;

    if (!(await this.enforceRateLimit('activity:respond', anonId, client))) {
      return;
    }

    let activity: ActivityDocument;
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    if (activity.status !== 'live' || activity.type !== 'wordcloud') {
      client.emit(ServerEvents.ERROR, {
        message: 'This word cloud is not live.',
      });
      return;
    }

    const eventId = activity.eventId.toString();

    try {
      await this.responseService.saveWordCloudResponse(activity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        words,
      });

      await this.analyticsService.invalidateCacheIfLive(eventId);
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string'
          ? err.message
          : 'Could not save word cloud response.';

      client.emit(ServerEvents.ERROR, { message });
      return;
    }

    client.emit(ServerEvents.ACTIVITY_RESPONDED, { activityId });
    this.scheduleWordCloudBroadcast(activityId, eventId);
  }

  @SubscribeMessage(ClientEvents.QUIZ_NEXT_QUESTION)
  async handleQuizNextQuestion(
    @MessageBody() payload: { activityId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(activityIdSchema, payload, client);
    if (!data) return;

    await this.advanceQuizQuestion(data.activityId, client);
  }

  @SubscribeMessage(ClientEvents.QUIZ_ANSWER)
  async handleQuizAnswer(
    @MessageBody()
    payload: {
      activityId: string;
      anonId: string;
      questionId: string;
      optionId: string;
      clientTimeMs?: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(quizAnswerSchema, payload, client);
    if (!data) return;
    const { activityId, anonId, questionId, optionId } = data;

    if (!(await this.enforceRateLimit('activity:respond', anonId, client))) {
      return;
    }

    let activity: ActivityDocument;
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    if (activity.status !== 'live' || activity.type !== 'quiz') {
      client.emit(ServerEvents.ERROR, { message: 'This quiz is not live.' });
      return;
    }

    const runtime = quizRuntimeByActivityId.get(activityId);
    if (!runtime || runtime.questionId !== questionId) {
      client.emit(ServerEvents.ERROR, {
        message: 'This quiz question is not currently active.',
      });
      return;
    }

    const now = Date.now();
    if (now > runtime.endsAt) {
      client.emit(ServerEvents.ERROR, {
        message: 'This quiz question is already closed.',
      });
      return;
    }

    const eventId = activity.eventId.toString();

    const speedBonusEnabled =
      isQuizConfig(activity.config) && activity.config.speedBonusEnabled === true;

    try {
      const saved = await this.responseService.saveQuizAnswer(activity, {
        activityId,
        eventId,
        participantAnonId: anonId,
        questionId,
        optionId,
        endsAt: runtime.endsAt,
        answeredAt: now,
        speedBonusEnabled,
      });

      await this.analyticsService.invalidateCacheIfLive(eventId);

      client.emit(ServerEvents.ACTIVITY_RESPONDED, {
        activityId,
        questionId,
        isCorrect: saved.isCorrect,
        awardedPoints: saved.awardedPoints,
      });
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string'
          ? err.message
          : 'Could not save quiz answer.';

      client.emit(ServerEvents.ERROR, { message });
    }
  }

  @SubscribeMessage(ClientEvents.QA_ASK)
  async handleQaAsk(
    @MessageBody()
    payload: {
      eventCode: string;
      anonId: string;
      text: string;
      displayName?: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(qaAskSchema, payload, client);
    if (!data) return;
    const { eventCode, anonId, text, displayName } = data;

    if (!(await this.enforceRateLimit('qa:ask', anonId, client))) {
      return;
    }

    const event = await this.resolveJoinableEvent(eventCode, client);
    if (!event) {
      return;
    }

    const eventId = event._id.toString();
    const requireModeration = Boolean(event.settings?.requireModeration);
    const status = requireModeration ? 'pending' : 'approved';

    // FIX: When allowAnonymousQA is true, participants should appear as Anonymous.
    // Strip the authorName server-side so it can never leak through even if the
    // client sends a displayName. When allowAnonymousQA is false, use whatever
    // name the participant provided.
    const allowAnonymousQA = Boolean(event.settings?.allowAnonymousQA);
    const authorName = allowAnonymousQA ? null : displayName?.trim() || null;

    const question = await this.questionsService.create({
      eventId,
      text: text.trim(),
      authorAnonId: anonId,
      authorName,
      status,
    });

    await this.analyticsService.invalidateCacheIfLive(eventId);

    if (requireModeration) {
      this.server.to(rooms.host(eventId)).emit(ServerEvents.QA_NEW, { question });
    } else {
      this.server.to(rooms.event(eventId)).emit(ServerEvents.QA_NEW, { question });
    }

    this.logger.log(
      `qa:ask eventId=${eventId} questionId=${question._id.toString()} status=${status} anonymous=${allowAnonymousQA}`,
    );
  }

  @SubscribeMessage(ClientEvents.QA_UPVOTE)
  async handleQaUpvote(
    @MessageBody()
    payload: {
      questionId: string;
      anonId: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(qaUpvoteSchema, payload, client);
    if (!data) return;
    const { questionId, anonId } = data;

    try {
      const question = await this.questionsService.addVote(questionId, anonId);
      const eventId = question.eventId.toString();

      await this.analyticsService.invalidateCacheIfLive(eventId);

      this.server.to(rooms.event(eventId)).emit(ServerEvents.QA_UPDATED, { question });

      this.logger.log(`qa:upvote eventId=${eventId} questionId=${questionId} anonId=${anonId}`);
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string'
          ? err.message
          : 'Could not upvote question.';

      client.emit(ServerEvents.ERROR, { message });
    }
  }

  @SubscribeMessage(ClientEvents.QA_MODERATE)
  async handleQaModerate(
    @MessageBody()
    payload: {
      questionId: string;
      status: 'approved' | 'dismissed' | 'answered';
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(qaModerateSchema, payload, client);
    if (!data) return;
    const { questionId, status } = data;

    try {
      const question = await this.questionsService.updateStatus(questionId, status);
      const eventId = question.eventId.toString();

      await this.analyticsService.invalidateCacheIfLive(eventId);

      if (status === 'approved') {
        this.server.to(rooms.event(eventId)).emit(ServerEvents.QA_NEW, { question });
      }

      // Emit to both host and event rooms so pending-question status changes
      // (dismiss, answered) always reach the host dashboard.
      this.server
        .to(rooms.host(eventId))
        .to(rooms.event(eventId))
        .emit(ServerEvents.QA_UPDATED, { question });

      this.logger.log(`qa:moderate eventId=${eventId} questionId=${questionId} status=${status}`);
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string'
          ? err.message
          : 'Could not moderate question.';

      client.emit(ServerEvents.ERROR, { message });
    }
  }

  @SubscribeMessage(ClientEvents.QA_REPLY)
  async handleQaReply(
    @MessageBody()
    payload: {
      questionId: string;
      answerText: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(qaReplySchema, payload, client);
    if (!data) return;
    const { questionId, answerText } = data;

    try {
      const question = await this.questionsService.reply(questionId, answerText);
      const eventId = question.eventId.toString();

      await this.analyticsService.invalidateCacheIfLive(eventId);

      this.server
        .to(rooms.host(eventId))
        .to(rooms.event(eventId))
        .emit(ServerEvents.QA_UPDATED, { question });

      this.logger.log(`qa:reply eventId=${eventId} questionId=${questionId}`);
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string' ? err.message : 'Could not save reply.';

      client.emit(ServerEvents.ERROR, { message });
    }
  }

  @SubscribeMessage(ClientEvents.SESSION_END)
  async handleSessionEnd(
    @MessageBody() payload: { eventId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const data = this.parsePayload(sessionEndSchema, payload, client);
    if (!data) return;
    const { eventId } = data;

    try {
      await this.eventsService.endEvent(eventId);
      const report = await this.analyticsService.generateReport(eventId);
      await this.analyticsService.cacheFinalReport(eventId, report);

      this.server.to(rooms.event(eventId)).emit(ServerEvents.SESSION_ENDED, {
        eventId,
      });

      this.logger.log(`session:end eventId=${eventId}`);
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string' ? err.message : 'Could not end session.';

      client.emit(ServerEvents.ERROR, { message });
    }
  }

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
   * Builds the session snapshot sent to a connecting socket.
   *
   * mode controls question visibility:
   *  - 'participant' → approved questions only
   *  - 'observer'   → approved + pending (host dashboard survives reconnect)
   *
   * allowAnonymousQA is forwarded so clients know whether to show author names.
   */
  private async buildSnapshot(
    event: {
      activeActivityId: unknown;
      _id: unknown;
      settings?: {
        allowAnonymousQA?: boolean;
        requireModeration?: boolean;
        participantNames?: boolean;
      } | null;
    },
    mode: 'participant' | 'observer' = 'participant',
  ) {
    const eventId = (event as { _id: { toString(): string } })._id.toString();
    let activeActivity: ActivityDocument | null = null;
    let currentTally: PollTally | null = null;
    let currentQuizQuestion: Record<string, unknown> | null = null;
    let currentQuizLeaderboard: Array<{ name: string; points: number }> | null = null;
    let currentWordCloud: Array<{ text: string; weight: number }> | null = null;
    let pollEndsAt: number | null = null;

    if (event.activeActivityId) {
      try {
        activeActivity = await this.activityService.findById(event.activeActivityId.toString());

        const runtime = pollRuntimeByActivityId.get(activeActivity._id.toString());
        if (runtime) pollEndsAt = runtime.endsAt;

        if (activeActivity.type === 'poll') {
          currentTally = await this.responseService.computeTally(
            activeActivity._id.toString(),
            activeActivity,
          );
        }

        if (activeActivity.type === 'quiz') {
          currentQuizLeaderboard = await this.responseService.computeQuizLeaderboard(
            activeActivity._id.toString(),
          );

          const runtimeQuiz = quizRuntimeByActivityId.get(activeActivity._id.toString());
          if (runtimeQuiz) {
            const config = activeActivity.config;
            if (isQuizConfig(config)) {
              const question = getQuizQuestion(config, runtimeQuiz.questionId);
              if (question) {
                currentQuizQuestion = {
                  activityId: activeActivity._id.toString(),
                  ...sanitizeQuizQuestionForBroadcast(question),
                  endsAt: runtimeQuiz.endsAt,
                };
              }
            }
          }
        }

        if (activeActivity.type === 'wordcloud') {
          currentWordCloud = await this.responseService.computeWordCloud(
            activeActivity._id.toString(),
          );
        }
      } catch {
        activeActivity = null;
      }
    }

    const approvedQuestions = await this.questionsService.findApprovedByEvent(eventId);

    let pendingQuestions: Awaited<ReturnType<typeof this.questionsService.findByEvent>> = [];
    if (mode === 'observer') {
      const all = await this.questionsService.findByEvent(eventId);
      pendingQuestions = all.filter((q) => q.status === 'pending');
    }

    // FIX: Forward allowAnonymousQA so participant clients know whether to
    // display author names. Default true so unknown states are safe (anonymous).
    const allowAnonymousQA = event.settings?.allowAnonymousQA ?? true;

    return {
      activeActivityId: event.activeActivityId ? event.activeActivityId.toString() : null,
      activeActivity,
      currentTally,
      currentQuizQuestion,
      currentQuizLeaderboard,
      currentWordCloud,
      pollEndsAt,
      approvedQuestions,
      pendingQuestions,
      allowAnonymousQA,
    };
  }

  private schedulePollResultsBroadcast(
    activityId: string,
    eventId: string,
    activity: ActivityDocument,
  ): void {
    const existing = pollBroadcastTimers.get(activityId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      pollBroadcastTimers.delete(activityId);
      try {
        const tallies = await this.responseService.computeTally(activityId, activity);
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.POLL_RESULTS, { activityId, tallies });
      } catch (err: unknown) {
        this.logger.error(`Failed to broadcast poll:results for activityId=${activityId}`, err);
      }
    }, 250);

    pollBroadcastTimers.set(activityId, timer);
  }

  private scheduleWordCloudBroadcast(activityId: string, eventId: string): void {
    const existing = wordCloudBroadcastTimers.get(activityId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      wordCloudBroadcastTimers.delete(activityId);
      try {
        const words = await this.responseService.computeWordCloud(activityId);
        this.server.to(rooms.event(eventId)).emit(ServerEvents.WORDCLOUD_UPDATE, { words });
      } catch (err: unknown) {
        this.logger.error(`Failed to broadcast wordcloud:update for activityId=${activityId}`, err);
      }
    }, 250);

    wordCloudBroadcastTimers.set(activityId, timer);
  }

  private async advanceQuizQuestion(activityId: string, client?: Socket): Promise<void> {
    if (quizAdvanceLocks.has(activityId)) {
      return;
    }

    quizAdvanceLocks.add(activityId);

    try {
      let activity: ActivityDocument;
      try {
        activity = await this.activityService.findById(activityId);
      } catch {
        client?.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
        return;
      }

      if (activity.status !== 'live' || activity.type !== 'quiz') {
        client?.emit(ServerEvents.ERROR, { message: 'This quiz is not live.' });
        return;
      }

      const config = activity.config;
      if (!isQuizConfig(config)) {
        client?.emit(ServerEvents.ERROR, {
          message: 'Activity config is not a valid quiz config.',
        });
        return;
      }

      const eventId = activity.eventId.toString();
      const existingRuntime = quizRuntimeByActivityId.get(activityId);

      if (existingRuntime?.timeout) {
        clearTimeout(existingRuntime.timeout);
      }

      if (existingRuntime) {
        const leaderboard = await this.responseService.computeQuizLeaderboard(activityId);
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.QUIZ_LEADERBOARD, { top: leaderboard });
      }

      const nextIndex = existingRuntime ? existingRuntime.questionIndex + 1 : 0;
      const question = config.questions[nextIndex];

      if (!question) {
        this.clearQuizRuntime(activityId);

        const leaderboard = await this.responseService.computeQuizLeaderboard(activityId);
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.QUIZ_LEADERBOARD, { top: leaderboard });

        await this.activityService.setStatus(activityId, 'closed');
        await this.eventsService.setActiveActivity(eventId, null);

        this.server.to(rooms.event(eventId)).emit(ServerEvents.ACTIVITY_CLOSED, { activityId });

        return;
      }

      const endsAt = Date.now() + question.timeLimitSec * 1000;

      const timeout = setTimeout(async () => {
        const currentRuntime = quizRuntimeByActivityId.get(activityId);
        if (!currentRuntime || currentRuntime.questionId !== question.id) {
          return;
        }

        try {
          const leaderboard = await this.responseService.computeQuizLeaderboard(activityId);
          this.server
            .to(rooms.event(eventId))
            .emit(ServerEvents.QUIZ_LEADERBOARD, { top: leaderboard });
        } catch (err: unknown) {
          this.logger.error(
            `Failed to broadcast quiz leaderboard for activityId=${activityId}`,
            err,
          );
        }

        quizRuntimeByActivityId.set(activityId, {
          ...currentRuntime,
          timeout: null,
        });

        setTimeout(() => {
          void this.advanceQuizQuestion(activityId);
        }, 1500);
      }, question.timeLimitSec * 1000);

      quizRuntimeByActivityId.set(activityId, {
        activityId,
        eventId,
        questionId: question.id,
        questionIndex: nextIndex,
        endsAt,
        timeout,
      });

      this.server.to(rooms.event(eventId)).emit(ServerEvents.QUIZ_QUESTION, {
        activityId,
        ...sanitizeQuizQuestionForBroadcast(question),
        endsAt,
      });
    } finally {
      quizAdvanceLocks.delete(activityId);
    }
  }

  private clearQuizRuntime(activityId: string): void {
    const runtime = quizRuntimeByActivityId.get(activityId);
    if (runtime?.timeout) {
      clearTimeout(runtime.timeout);
    }
    quizRuntimeByActivityId.delete(activityId);
    quizAdvanceLocks.delete(activityId);
  }

  private connectionsKey(eventId: string): string {
    return `event:${eventId}:connections`;
  }

  private async incrementConnection(eventId: string, anonId: string): Promise<void> {
    await this.redisService.client.hincrby(this.connectionsKey(eventId), anonId, 1);
  }

  private async decrementConnection(eventId: string, anonId: string): Promise<number> {
    const key = this.connectionsKey(eventId);
    const remaining = await this.redisService.client.hincrby(key, anonId, -1);
    if (remaining <= 0) {
      await this.redisService.client.hdel(key, anonId);
    }
    return remaining;
  }

  private async getCount(eventId: string): Promise<number> {
    return this.redisService.client.hlen(this.connectionsKey(eventId));
  }

  private async broadcastCount(eventId: string): Promise<void> {
    const count = await this.getCount(eventId);
    this.server.to(rooms.event(eventId)).emit(ServerEvents.PARTICIPANT_COUNT, { count });
  }
}
