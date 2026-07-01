import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventDocument, EventEntity } from '../events/event.schema';
import { ActivityDocument, ActivityEntity } from '../activities/activity.schema';
import { ResponseDocument, ResponseEntity } from '../responses/response.schema';
import { QuestionDocument, QuestionEntity } from '../questions/question.schema';
import {
  ParticipantDocument,
  ParticipantEntity,
} from '../participants/participant.schema';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { RedisService } from '../realtime/redis.service';

import { SurveySessionDocument, SurveySessionEntity } from '../survey-sessions/survey-session.schema';

type MinuteBucket = {
  minute: string;
  responses: number;
};

type TimestampFields = {
  createdAt?: Date | null;
  updatedAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
};

type EventWithTimestamps = EventEntity & { _id: Types.ObjectId } & TimestampFields;
type QuestionWithTimestamps = QuestionEntity & {
  _id: Types.ObjectId;
} & TimestampFields;

@Injectable()
export class AnalyticsService {
  private static readonly CACHE_TTL_SECONDS = 60 * 60;

  constructor(
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(ActivityEntity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(ResponseEntity.name)
    private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(QuestionEntity.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(ParticipantEntity.name)
    private readonly participantModel: Model<ParticipantDocument>,
    @InjectModel(SurveySessionEntity.name)
    private readonly surveySessionModel: Model<SurveySessionDocument>,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) { }

  private cacheKey(eventId: string): string {
    return `analytics:event:${eventId}`;
  }

  async getWorkspaceOverview(user: AuthenticatedUser) {
    const hostUser = await this.usersService.findById(user._id);
    if (!hostUser) throw new NotFoundException('User not found');

    const hostObjectId = new Types.ObjectId(user._id);

    const events = await this.eventModel.find({ hostId: hostObjectId }).select('_id status').lean().exec();
    
    let totalEvents = 0;
    let draftCount = 0;
    let liveCount = 0;
    let completedCount = 0;
    const eventIds = [];

    for (const event of events) {
      totalEvents++;
      eventIds.push(event._id);
      if (event.status === 'draft') draftCount++;
      else if (event.status === 'live') liveCount++;
      else if (event.status === 'ended') completedCount++;
    }

    const [participantsCount, responsesCount, questionsCount] = await Promise.all([
      this.participantModel.countDocuments({ eventId: { $in: eventIds } }).exec(),
      this.responseModel.countDocuments({ eventId: { $in: eventIds } }).exec(),
      this.questionModel.countDocuments({ eventId: { $in: eventIds } }).exec(),
    ]);

    return {
      totalEvents,
      draftCount,
      completedCount,
      liveCount,
      totalParticipants: participantsCount,
      totalResponses: responsesCount + questionsCount,
      aiUsage: hostUser.aiUsageCount ?? 0,
    };
  }

  async getAnalytics(eventId: string, user: AuthenticatedUser) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    const event = await this.eventModel.findById(eventId).lean().exec();
    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    await this.assertEventOwnership(event as EventWithTimestamps, user);

    const cacheKey = this.cacheKey(eventId);
    const cached = await this.redisService.client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.generateReport(eventId);

    const eventStatus = (event as EventWithTimestamps & { status?: string }).status;
    if (eventStatus === 'ended') {
      await this.cacheFinalReport(eventId, analytics);
    } else {
      await this.redisService.client.set(
        cacheKey,
        JSON.stringify(analytics),
        'EX',
        AnalyticsService.CACHE_TTL_SECONDS,
      );
    }

    return analytics;
  }

  async invalidateCacheIfLive(eventId: string): Promise<void> {
    if (!Types.ObjectId.isValid(eventId)) return;

    const event = await this.eventModel
      .findById(eventId, { status: 1 })
      .lean()
      .exec();

    if (!event || (event as any).status === 'ended') {
      return;
    }

    await this.redisService.client.del(this.cacheKey(eventId));
  }

  /** @deprecated Use invalidateCacheIfLive() from socket handlers. */
  async invalidateCache(eventId: string): Promise<void> {
    await this.redisService.client.del(this.cacheKey(eventId));
  }

  async cacheFinalReport(eventId: string, report: unknown): Promise<void> {
    await this.redisService.client.set(
      this.cacheKey(eventId),
      JSON.stringify(report),
    );
  }

  async generateReport(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    const eventObjectId = new Types.ObjectId(eventId);

    const rawEvent = await this.eventModel.findById(eventObjectId).lean().exec();
    if (!rawEvent) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }
    const event = rawEvent as EventWithTimestamps;

    const [
      totalParticipants,
      totalResponses,
      distinctRespondersAgg,
      pollAnalytics,
      quizAnalytics,
      qaAnalytics,
      wordCloudAnalytics,
      feedbackAnalytics,
      surveyAnalytics,
      engagementTimeline,
    ] = await Promise.all([
      this.participantModel.countDocuments({ eventId: eventObjectId }).exec(),
      this.responseModel.countDocuments({ eventId: eventObjectId }).exec(),
      this.responseModel.aggregate<{ _id: string; count: number }>([
        { $match: { eventId: eventObjectId } },
        { $group: { _id: '$participantAnonId' } },
        { $count: 'count' },
      ]),
      this.buildPollAnalytics(eventObjectId),
      this.buildQuizAnalytics(eventObjectId),
      this.buildQaAnalytics(eventObjectId),
      this.buildWordCloudAnalytics(eventObjectId),
      this.buildFeedbackAnalytics(eventObjectId),
      this.buildSurveyAnalytics(eventObjectId),
      this.buildEngagementTimeline(eventObjectId),
    ]);

    const uniqueResponders = distinctRespondersAgg[0]?.count ?? 0;
    const participationRate =
      totalParticipants === 0
        ? 0
        : Number(((uniqueResponders / totalParticipants) * 100).toFixed(2));

    return {
      eventId: event._id.toString(),
      generatedAt: new Date().toISOString(),
      headlineStats: {
        totalParticipants,
        totalResponses,
        uniqueResponders,
        participationRate,
      },
      pollAnalytics,
      quizAnalytics,
      qaAnalytics,
      wordCloudAnalytics,
      feedbackAnalytics,
      surveyAnalytics,
      engagementTimeline,
    };
  }

  private async assertEventOwnership(
    event: EventWithTimestamps,
    user: AuthenticatedUser,
  ): Promise<void> {
    const currentUser = await this.usersService.findById(user._id);
    const eventHostId = event.hostId.toString();
    const currentUserId = currentUser._id.toString();

    if (eventHostId !== currentUserId) {
      throw new ForbiddenException(
        'You do not have access to this event analytics',
      );
    }
  }

  private async buildPollAnalytics(eventId: Types.ObjectId) {
    const pollActivities = await this.activityModel
      .find({ eventId, type: 'poll' })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    return Promise.all(
      pollActivities.map(async (activity) => {
        const responses = await this.responseModel
          .find({
            eventId,
            activityId: activity._id,
          })
          .lean()
          .exec();

        const totalResponses = responses.length;
        const config = activity.config as {
          pollType?: 'single' | 'multiple' | 'rating' | 'open';
          question?: string;
          options?: Array<{ id: string; label: string }>;
          ratingScale?: number;
        };

        const pollType = config?.pollType ?? 'single';
        const title = config?.question ?? activity.title;

        if (pollType === 'open') {
          return {
            activityId: activity._id.toString(),
            title,
            pollType,
            totalResponses,
            responses: responses
              .map((r) => r.textValue)
              .filter((value): value is string => Boolean(value?.trim())),
          };
        }

        if (pollType === 'rating') {
          const distributionMap = new Map<number, number>();

          for (const response of responses) {
            if (typeof response.ratingValue === 'number') {
              distributionMap.set(
                response.ratingValue,
                (distributionMap.get(response.ratingValue) ?? 0) + 1,
              );
            }
          }

          const distribution = Object.fromEntries(
            Array.from(distributionMap.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([rating, count]) => [String(rating), count]),
          );

          const ratingResponses = responses.filter(
            (r) => typeof r.ratingValue === 'number',
          );

          const average =
            ratingResponses.length === 0
              ? 0
              : Number(
                (
                  ratingResponses.reduce(
                    (sum, r) => sum + (r.ratingValue as number),
                    0,
                  ) / ratingResponses.length
                ).toFixed(2),
              );

          return {
            activityId: activity._id.toString(),
            title,
            pollType,
            totalResponses,
            average,
            distribution,
          };
        }

        const configuredOptions = Array.isArray(config?.options)
          ? config.options
          : [];

        const optionCounts = new Map<string, number>();
        for (const option of configuredOptions) {
          optionCounts.set(option.id, 0);
        }

        for (const response of responses) {
          const selected = Array.isArray(response.selectedOptionIds)
            ? response.selectedOptionIds
            : [];

          for (const optionId of selected) {
            optionCounts.set(optionId, (optionCounts.get(optionId) ?? 0) + 1);
          }
        }

        const totalVotes = Array.from(optionCounts.values()).reduce(
          (sum, count) => sum + count,
          0,
        );

        return {
          activityId: activity._id.toString(),
          title,
          pollType,
          totalResponses,
          options: configuredOptions.map((option) => {
            const count = optionCounts.get(option.id) ?? 0;
            return {
              id: option.id,
              label: option.label,
              count,
              percentage:
                totalVotes === 0 ? 0 : Number((count / totalVotes).toFixed(4)),
            };
          }),
        };
      }),
    );
  }

  private async buildQuizAnalytics(eventId: Types.ObjectId) {
    const quizActivities = await this.activityModel
      .find({ eventId, type: 'quiz' })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    // Pre-load all participant display names for this event once,
    // so every quiz activity can resolve anonId → displayName.
    const participants = await this.participantModel
      .find({ eventId }, { anonId: 1, displayName: 1 })
      .lean()
      .exec();

    const nameMap = new Map<string, string>();
    for (const p of participants) {
      if (p.displayName) {
        nameMap.set(p.anonId, p.displayName);
      }
    }

    return Promise.all(
      quizActivities.map(async (activity) => {
        const responses = await this.responseModel
          .find({
            eventId,
            activityId: activity._id,
            quizQuestionId: { $ne: null },
          })
          .lean()
          .exec();

        const scoreMap = new Map<string, number>();
        const correctCountMap = new Map<string, number>();
        const incorrectCountMap = new Map<string, number>();
        const questionAttemptMap = new Map<
          string,
          { total: number; correct: number }
        >();

        for (const response of responses) {
          const anonId = response.participantAnonId;
          scoreMap.set(
            anonId,
            (scoreMap.get(anonId) ?? 0) + (response.awardedPoints ?? 0),
          );

          if (response.isCorrect) {
            correctCountMap.set(anonId, (correctCountMap.get(anonId) ?? 0) + 1);
          } else {
            incorrectCountMap.set(anonId, (incorrectCountMap.get(anonId) ?? 0) + 1);
          }

          if (response.quizQuestionId) {
            const current = questionAttemptMap.get(response.quizQuestionId) ?? {
              total: 0,
              correct: 0,
            };
            current.total += 1;
            if (response.isCorrect) {
              current.correct += 1;
            }
            questionAttemptMap.set(response.quizQuestionId, current);
          }
        }

        const config = activity.config as {
          questions?: Array<{ id: string; text: string }>;
        };

        const configuredQuestions = Array.isArray(config?.questions)
          ? config.questions
          : [];

        const totalQuestions = configuredQuestions.length;

        const participantScores = Array.from(scoreMap.entries())
          .map(([participantAnonId, totalPoints]) => {
            const correct = correctCountMap.get(participantAnonId) ?? 0;
            const incorrect = incorrectCountMap.get(participantAnonId) ?? 0;
            const percentage =
              totalQuestions === 0
                ? 0
                : Number(((correct / totalQuestions) * 100).toFixed(1));

            return {
              participantAnonId,
              displayName: nameMap.get(participantAnonId) ?? null,
              totalPoints,
              correct,
              incorrect,
              percentage,
            };
          })
          .sort(
            (a, b) =>
              b.totalPoints - a.totalPoints ||
              a.participantAnonId.localeCompare(b.participantAnonId),
          );

        const leaderboard = participantScores.slice(0, 10);

        const questionStats = configuredQuestions.map((question) => {
          const stat = questionAttemptMap.get(question.id) ?? {
            total: 0,
            correct: 0,
          };

          return {
            questionId: question.id,
            text: question.text,
            total: stat.total,
            correct: stat.correct,
            incorrect: stat.total - stat.correct,
            correctPct:
              stat.total === 0
                ? 0
                : Number((stat.correct / stat.total).toFixed(4)),
          };
        });

        // Summary stats for scorecard
        const allScores = participantScores.map((p) => p.totalPoints);
        const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
        const averageScore =
          allScores.length > 0
            ? Number(
              (allScores.reduce((s, v) => s + v, 0) / allScores.length).toFixed(1),
            )
            : 0;
        const completionRate =
          totalQuestions === 0 || participantScores.length === 0
            ? 0
            : Number(
              (
                (participantScores.filter(
                  (p) => p.correct + p.incorrect === totalQuestions,
                ).length /
                  participantScores.length) *
                100
              ).toFixed(1),
            );

        return {
          activityId: activity._id.toString(),
          title: activity.title,
          leaderboard,
          participantScores,
          questionStats,
          summaryStats: {
            totalParticipants: participantScores.length,
            totalResponses: responses.length,
            averageScore,
            highestScore,
            completionRate,
          },
        };
      }),
    );
  }

  private async buildQaAnalytics(eventId: Types.ObjectId) {
    const [
      totalQuestions,
      approvedQuestions,
      answeredQuestions,
      rawTopQuestions,
    ] = await Promise.all([
      this.questionModel.countDocuments({ eventId }).exec(),
      this.questionModel.countDocuments({ eventId, status: 'approved' }).exec(),
      this.questionModel.countDocuments({ eventId, status: 'answered' }).exec(),
      this.questionModel
        .find({ eventId })
        .sort({ voteCount: -1, createdAt: -1 })
        .limit(20)
        .lean()
        .exec(),
    ]);

    const topQuestions = rawTopQuestions as QuestionWithTimestamps[];

    return {
      totalQuestions,
      approvedQuestions,
      answeredQuestions,
      topQuestions: topQuestions.map((q) => ({
        _id: q._id.toString(),
        text: q.text,
        voteCount: q.voteCount,
        status: q.status,
        authorName: q.authorName ?? null,
        createdAt: q.createdAt ?? null,
      })),
    };
  }

  private async buildWordCloudAnalytics(eventId: Types.ObjectId) {
    const wordCloudActivities = await this.activityModel
      .find({ eventId, type: 'wordcloud' })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    return Promise.all(
      wordCloudActivities.map(async (activity) => {
        const responses = await this.responseModel
          .find({
            eventId,
            activityId: activity._id,
          })
          .lean()
          .exec();

        const frequencyMap = new Map<string, number>();

        for (const response of responses) {
          const words = Array.isArray(response.words) ? response.words : [];
          for (const rawWord of words) {
            const word = String(rawWord).trim().toLowerCase();
            if (!word) continue;
            frequencyMap.set(word, (frequencyMap.get(word) ?? 0) + 1);
          }
        }

        const words = Array.from(frequencyMap.entries())
          .map(([text, weight]) => ({ text, weight }))
          .sort((a, b) => b.weight - a.weight || a.text.localeCompare(b.text));

        return {
          activityId: activity._id.toString(),
          title: activity.title,
          prompt:
            (activity.config as { prompt?: string })?.prompt ?? activity.title,
          words,
        };
      }),
    );
  }

  private async buildFeedbackAnalytics(eventId: Types.ObjectId) {
    const feedbackActivities = await this.activityModel
      .find({ eventId, type: 'feedback' })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    return Promise.all(
      feedbackActivities.map(async (activity) => {
        const responses = await this.responseModel
          .find({
            eventId,
            activityId: activity._id,
          })
          .lean()
          .exec();

        const config = activity.config as {
          prompt?: string;
          fields?: Array<{
            id: string;
            type: 'rating' | 'text';
            label: string;
          }>;
        };

        const configuredFields = Array.isArray(config?.fields)
          ? config.fields
          : [];

        const fields = configuredFields.map((field) => {
          const matchingAnswers = responses
            .flatMap((response) =>
              Array.isArray(response.feedbackAnswers)
                ? response.feedbackAnswers
                : [],
            )
            .filter((answer) => answer.fieldId === field.id);

          if (field.type === 'rating') {
            const ratingValues = matchingAnswers
              .map((answer) => answer.ratingValue)
              .filter((value): value is number => typeof value === 'number');

            const distributionMap = new Map<number, number>();
            for (const value of ratingValues) {
              distributionMap.set(value, (distributionMap.get(value) ?? 0) + 1);
            }

            const distribution = Object.fromEntries(
              Array.from(distributionMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([rating, count]) => [String(rating), count]),
            );

            const average =
              ratingValues.length === 0
                ? 0
                : Number(
                  (
                    ratingValues.reduce((sum, value) => sum + value, 0) /
                    ratingValues.length
                  ).toFixed(2),
                );

            return {
              fieldId: field.id,
              label: field.label,
              type: field.type,
              average,
              distribution,
              count: ratingValues.length,
            };
          }

          const responsesList = matchingAnswers
            .map((answer) => answer.textValue)
            .filter((value): value is string => Boolean(value?.trim()));

          return {
            fieldId: field.id,
            label: field.label,
            type: field.type,
            responses: responsesList,
            count: responsesList.length,
          };
        });

        return {
          activityId: activity._id.toString(),
          title: activity.title,
          prompt: config?.prompt ?? activity.title,
          totalResponses: responses.length,
          fields,
        };
      }),
    );
  }

  private async buildSurveyAnalytics(eventId: Types.ObjectId) {
    const surveyActivities = await this.activityModel
      .find({ eventId, type: 'survey' })
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();

    return Promise.all(
      surveyActivities.map(async (activity) => {
        const [sessions, responses] = await Promise.all([
          this.surveySessionModel.find({ activityId: activity._id }).lean().exec(),
          this.responseModel.find({ activityId: activity._id }).lean().exec(),
        ]);

        const totalStarted = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const totalCompleted = completedSessions.length;
        
        let totalTimeSec = 0;
        let validTimeCount = 0;
        for (const s of completedSessions) {
          if (s.startedAt && s.completedAt) {
            const ms = s.completedAt.getTime() - s.startedAt.getTime();
            if (ms > 0) {
              totalTimeSec += ms / 1000;
              validTimeCount++;
            }
          }
        }
        const averageCompletionTimeSec = validTimeCount > 0 ? Number((totalTimeSec / validTimeCount).toFixed(1)) : 0;
        const completionRate = totalStarted > 0 ? Number(((totalCompleted / totalStarted) * 100).toFixed(1)) : 0;
        const abandonmentRate = totalStarted > 0 ? Number((((totalStarted - totalCompleted) / totalStarted) * 100).toFixed(1)) : 0;

        const config = activity.config as any;
        const configuredQuestions = Array.isArray(config?.questions) ? config.questions : [];
        
        const questions = configuredQuestions.map((question: any) => {
          const qResponses = responses.filter(r => r.surveyQuestionId === question.id);
          const qTotalResponses = qResponses.length;
          const pollType = question.type;
          
          if (pollType === 'open') {
            return {
              activityId: activity._id.toString(), // map to the ActivityID to reuse Poll types
              title: question.title,
              pollType,
              totalResponses: qTotalResponses,
              responses: qResponses
                .map((r) => r.textValue)
                .filter((value): value is string => Boolean(value?.trim())),
            };
          }

          if (pollType === 'rating') {
            const distributionMap = new Map<number, number>();
            for (const r of qResponses) {
              if (typeof r.ratingValue === 'number') {
                distributionMap.set(r.ratingValue, (distributionMap.get(r.ratingValue) ?? 0) + 1);
              }
            }
            const distribution = Object.fromEntries(
              Array.from(distributionMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([rating, count]) => [String(rating), count]),
            );
            const ratingResponses = qResponses.filter((r) => typeof r.ratingValue === 'number');
            const average = ratingResponses.length === 0
              ? 0
              : Number((ratingResponses.reduce((sum, r) => sum + (r.ratingValue as number), 0) / ratingResponses.length).toFixed(2));
            return {
              activityId: activity._id.toString(),
              title: question.title,
              pollType,
              totalResponses: qTotalResponses,
              average,
              distribution,
            };
          }

          // Single / Multiple choice
          const optionCounts = new Map<string, number>();
          const configuredOptions = Array.isArray(question.options) ? question.options : [];
          for (const opt of configuredOptions) {
            optionCounts.set(opt.id, 0);
          }
          for (const r of qResponses) {
            const selected = Array.isArray(r.selectedOptionIds) ? r.selectedOptionIds : [];
            for (const optId of selected) {
              optionCounts.set(optId, (optionCounts.get(optId) ?? 0) + 1);
            }
          }
          const totalVotes = Array.from(optionCounts.values()).reduce((sum, c) => sum + c, 0);
          return {
            activityId: activity._id.toString(),
            title: question.title,
            pollType,
            totalResponses: qTotalResponses,
            options: configuredOptions.map((opt: any) => {
              const count = optionCounts.get(opt.id) ?? 0;
              return {
                id: opt.id,
                label: opt.label,
                count,
                percentage: totalVotes === 0 ? 0 : Number((count / totalVotes).toFixed(4)),
              };
            }),
          };
        });

        return {
          activityId: activity._id.toString(),
          title: activity.title,
          totalStarted,
          totalCompleted,
          completionRate,
          abandonmentRate,
          averageCompletionTimeSec,
          questions,
        };
      }),
    );
  }

  private async buildEngagementTimeline(
    eventId: Types.ObjectId,
  ): Promise<MinuteBucket[]> {
    return this.responseModel.aggregate<MinuteBucket>([
      { $match: { eventId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%dT%H:%M:00.000Z',
              date: '$createdAt',
            },
          },
          responses: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          minute: '$_id',
          responses: 1,
        },
      },
    ]);
  }
}
