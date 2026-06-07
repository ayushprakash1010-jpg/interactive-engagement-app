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
import type { ActivityDocument } from '../activities/activity.schema';
import type { PollTally } from '../activities/utils/tally.util';
import { ResponseService } from '../responses/response.service';
import { QuestionsService } from '../questions/questions.service';
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

// NOTE (scaling): these maps hold per-activity runtime state (debounce timers,
// the live quiz question/timer, and advance locks) in this process's memory.
// They are correct for the single-instance MVP, but do NOT survive a restart
// and are NOT shared across API instances. Before running multiple API
// instances behind the Redis adapter (Phase 2 / Sprint 8), this state must move
// to Redis (e.g. quiz runtime keyed by activityId with a TTL) so any instance
// can drive the timer and re-sync after a failover.
const pollBroadcastTimers = new Map<string, NodeJS.Timeout>();
const wordCloudBroadcastTimers = new Map<string, NodeJS.Timeout>();
const quizRuntimeByActivityId = new Map<string, QuizRuntimeState>();
const quizAdvanceLocks = new Set<string>();

@WebSocketGateway({ cors: true })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  private readonly socketState = new Map<string, SocketState>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly participantService: ParticipantService,
    private readonly redisService: RedisService,
    private readonly activityService: ActivityService,
    private readonly responseService: ResponseService,
    private readonly questionsService: QuestionsService,
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

    this.socketState.set(client.id, { role: 'observer', eventId });
    await client.join(rooms.event(eventId));
    await client.join(rooms.host(eventId));

    client.emit(ServerEvents.PARTICIPANT_COUNT, {
      count: await this.getCount(eventId),
    });

    const snapshot = await this.buildSnapshot(event);
    client.emit(ServerEvents.SESSION_SNAPSHOT, snapshot);

    this.logger.log(`Observer joined event=${event.eventCode}`);
  }

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

    let activity: { eventId: { toString(): string }; _id: { toString(): string } };
    try {
      activity = await this.activityService.findById(activityId);
    } catch {
      client.emit(ServerEvents.ERROR, { message: 'Activity not found.' });
      return;
    }

    const eventId = activity.eventId.toString();

    const closed = await this.activityService.closeLiveActivity(eventId);
    if (closed) {
      this.clearQuizRuntime(closed._id.toString());

      const pollTimer = pollBroadcastTimers.get(closed._id.toString());
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollBroadcastTimers.delete(closed._id.toString());
      }

      const wordCloudTimer = wordCloudBroadcastTimers.get(closed._id.toString());
      if (wordCloudTimer) {
        clearTimeout(wordCloudTimer);
        wordCloudBroadcastTimers.delete(closed._id.toString());
      }

      this.server
        .to(rooms.event(eventId))
        .emit(ServerEvents.ACTIVITY_CLOSED, {
          activityId: closed._id.toString(),
        });
    }

    const liveActivity = await this.activityService.setStatus(activityId, 'live');
    await this.eventsService.setActiveActivity(eventId, activityId);

    this.server
      .to(rooms.event(eventId))
      .emit(ServerEvents.ACTIVITY_LAUNCHED, { activity: liveActivity });

    this.logger.log(`activity:launched activityId=${activityId} eventId=${eventId}`);
  }

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

    this.clearQuizRuntime(activityId);

    this.server
      .to(rooms.event(eventId))
      .emit(ServerEvents.ACTIVITY_CLOSED, { activityId });

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
    const {
      activityId,
      anonId,
      selectedOptionIds,
      textValue,
      ratingValue,
      feedbackAnswers,
    } = payload ?? {};

    if (!activityId || !anonId) {
      client.emit(ServerEvents.ERROR, {
        message: 'activityId and anonId are required.',
      });
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

        client.emit(ServerEvents.ACTIVITY_RESPONDED, { activityId });
        return;
      }

      client.emit(ServerEvents.ERROR, {
        message:
          'activity:respond is only supported for poll and feedback activities.',
      });
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string'
          ? err.message
          : 'Could not save response.';

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
    const { activityId, anonId, words } = payload ?? {};

    if (!activityId || !anonId) {
      client.emit(ServerEvents.ERROR, {
        message: 'activityId and anonId are required.',
      });
      return;
    }

    if (!Array.isArray(words)) {
      client.emit(ServerEvents.ERROR, {
        message: 'words must be an array.',
      });
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
    const { activityId } = payload ?? {};

    if (!activityId) {
      client.emit(ServerEvents.ERROR, { message: 'activityId is required.' });
      return;
    }

    await this.advanceQuizQuestion(activityId, client);
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
    const { activityId, anonId, questionId, optionId } = payload ?? {};

    if (!activityId || !anonId || !questionId || !optionId) {
      client.emit(ServerEvents.ERROR, {
        message: 'activityId, anonId, questionId, and optionId are required.',
      });
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
    const { eventCode, anonId, text, displayName } = payload ?? {};

    if (!eventCode || !anonId || !text?.trim()) {
      client.emit(ServerEvents.ERROR, {
        message: 'eventCode, anonId, and text are required.',
      });
      return;
    }

    const event = await this.resolveJoinableEvent(eventCode, client);
    if (!event) {
      return;
    }

    const eventId = event._id.toString();
    const requireModeration = Boolean(event.settings?.requireModeration);
    const status = requireModeration ? 'pending' : 'approved';

    const question = await this.questionsService.create({
      eventId,
      text: text.trim(),
      authorAnonId: anonId,
      authorName: displayName?.trim() || null,
      status,
    });

    if (requireModeration) {
      this.server
        .to(rooms.host(eventId))
        .emit(ServerEvents.QA_NEW, { question });
    } else {
      this.server
        .to(rooms.event(eventId))
        .emit(ServerEvents.QA_NEW, { question });
    }

    this.logger.log(
      `qa:ask eventId=${eventId} questionId=${question._id.toString()} status=${status}`,
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
    const { questionId, anonId } = payload ?? {};

    if (!questionId || !anonId) {
      client.emit(ServerEvents.ERROR, {
        message: 'questionId and anonId are required.',
      });
      return;
    }

    try {
      const question = await this.questionsService.addVote(questionId, anonId);
      const eventId = question.eventId.toString();

      this.server
        .to(rooms.event(eventId))
        .emit(ServerEvents.QA_UPDATED, { question });

      this.logger.log(
        `qa:upvote eventId=${eventId} questionId=${questionId} anonId=${anonId}`,
      );
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
    const { questionId, status } = payload ?? {};

    if (!questionId || !status) {
      client.emit(ServerEvents.ERROR, {
        message: 'questionId and status are required.',
      });
      return;
    }

    if (!['approved', 'dismissed', 'answered'].includes(status)) {
      client.emit(ServerEvents.ERROR, {
        message: 'status must be approved, dismissed, or answered.',
      });
      return;
    }

    try {
      const question = await this.questionsService.updateStatus(questionId, status);
      const eventId = question.eventId.toString();

      if (status === 'approved') {
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.QA_NEW, { question });
      }

      this.server
        .to(rooms.event(eventId))
        .emit(ServerEvents.QA_UPDATED, { question });

      this.logger.log(
        `qa:moderate eventId=${eventId} questionId=${questionId} status=${status}`,
      );
    } catch (err: unknown) {
      const message =
        isRecord(err) && typeof err.message === 'string'
          ? err.message
          : 'Could not moderate question.';

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

  private async buildSnapshot(event: {
    activeActivityId: unknown;
    _id: unknown;
  }) {
    const eventId = (event as { _id: { toString(): string } })._id.toString();
    let activeActivity: ActivityDocument | null = null;
    let currentTally: PollTally | null = null;
    let currentQuizQuestion: Record<string, unknown> | null = null;
    let currentQuizLeaderboard: Array<{ name: string; points: number }> | null = null;
    let currentWordCloud: Array<{ text: string; weight: number }> | null = null;

    if (event.activeActivityId) {
      try {
        activeActivity = await this.activityService.findById(
          event.activeActivityId.toString(),
        );

        if (activeActivity.type === 'poll') {
          currentTally = await this.responseService.computeTally(
            activeActivity._id.toString(),
            activeActivity,
          );
        }

        if (activeActivity.type === 'quiz') {
          currentQuizLeaderboard =
            await this.responseService.computeQuizLeaderboard(
              activeActivity._id.toString(),
            );

          const runtime = quizRuntimeByActivityId.get(activeActivity._id.toString());
          if (runtime) {
            const config = activeActivity.config;
            if (isQuizConfig(config)) {
              const question = getQuizQuestion(config, runtime.questionId);
              if (question) {
                currentQuizQuestion = {
                  activityId: activeActivity._id.toString(),
                  ...sanitizeQuizQuestionForBroadcast(question),
                  endsAt: runtime.endsAt,
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

    return {
      activeActivityId: event.activeActivityId
        ? event.activeActivityId.toString()
        : null,
      activeActivity,
      currentTally,
      currentQuizQuestion,
      currentQuizLeaderboard,
      currentWordCloud,
      approvedQuestions: await this.questionsService.findApprovedByEvent(eventId),
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
        const tallies = await this.responseService.computeTally(
          activityId,
          activity,
        );
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.POLL_RESULTS, { activityId, tallies });
      } catch (err: unknown) {
        this.logger.error(
          `Failed to broadcast poll:results for activityId=${activityId}`,
          err,
        );
      }
    }, 250);

    pollBroadcastTimers.set(activityId, timer);
  }

  private scheduleWordCloudBroadcast(
    activityId: string,
    eventId: string,
  ): void {
    const existing = wordCloudBroadcastTimers.get(activityId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      wordCloudBroadcastTimers.delete(activityId);
      try {
        const words = await this.responseService.computeWordCloud(activityId);
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.WORDCLOUD_UPDATE, { words });
      } catch (err: unknown) {
        this.logger.error(
          `Failed to broadcast wordcloud:update for activityId=${activityId}`,
          err,
        );
      }
    }, 250);

    wordCloudBroadcastTimers.set(activityId, timer);
  }

  private async advanceQuizQuestion(
    activityId: string,
    client?: Socket,
  ): Promise<void> {
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
        const leaderboard =
          await this.responseService.computeQuizLeaderboard(activityId);
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.QUIZ_LEADERBOARD, { top: leaderboard });
      }

      const nextIndex = existingRuntime ? existingRuntime.questionIndex + 1 : 0;
      const question = config.questions[nextIndex];

      if (!question) {
        this.clearQuizRuntime(activityId);

        const leaderboard =
          await this.responseService.computeQuizLeaderboard(activityId);
        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.QUIZ_LEADERBOARD, { top: leaderboard });

        await this.activityService.setStatus(activityId, 'closed');
        await this.eventsService.setActiveActivity(eventId, null);

        this.server
          .to(rooms.event(eventId))
          .emit(ServerEvents.ACTIVITY_CLOSED, { activityId });

        return;
      }

      const endsAt = Date.now() + question.timeLimitSec * 1000;

      const timeout = setTimeout(async () => {
        const currentRuntime = quizRuntimeByActivityId.get(activityId);
        if (!currentRuntime || currentRuntime.questionId !== question.id) {
          return;
        }

        try {
          const leaderboard =
            await this.responseService.computeQuizLeaderboard(activityId);
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

      this.server
        .to(rooms.event(eventId))
        .emit(ServerEvents.QUIZ_QUESTION, {
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