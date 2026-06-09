import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseEntity, ResponseDocument } from './response.schema';
import { ActivityDocument } from '../activities/activity.schema';
import { computePollTally, PollTally } from '../activities/utils/tally.util';
import { sanitizeText } from '../common/sanitize';
import {
  QuizConfig,
  QuizQuestion,
  computeQuizPoints,
  getQuizQuestion,
} from '../activities/utils/quiz.util';
import {
  ParticipantEntity,
  ParticipantDocument,
} from '../participants/participant.schema';

type PollConfigInput = Parameters<typeof computePollTally>[0];

export interface SaveResponseDto {
  activityId: string;
  eventId: string;
  participantAnonId: string;
  selectedOptionIds?: string[];
  textValue?: string;
  ratingValue?: number;
}

export interface SaveFeedbackResponseDto {
  activityId: string;
  eventId: string;
  participantAnonId: string;
  feedbackAnswers?: Array<{
    fieldId: string;
    type: 'rating' | 'text';
    ratingValue?: number;
    textValue?: string;
  }>;
}

export interface SaveQuizAnswerDto {
  activityId: string;
  eventId: string;
  participantAnonId: string;
  questionId: string;
  optionId: string;
  endsAt: number;
  answeredAt: number;
  speedBonusEnabled?: boolean;
}

export interface SaveWordCloudResponseDto {
  activityId: string;
  eventId: string;
  participantAnonId: string;
  words: string[];
}

type FeedbackField = {
  id: string;
  type: 'rating' | 'text';
  label: string;
};

type FeedbackConfig = {
  prompt: string;
  fields: FeedbackField[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPollOption(value: unknown): value is { id: string; label: string } {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.label === 'string';
}

function isPollConfig(value: unknown): value is PollConfigInput {
  if (!isRecord(value)) {
    return false;
  }

  const pollType = value.pollType;
  if (
    pollType !== 'single' &&
    pollType !== 'multiple' &&
    pollType !== 'rating' &&
    pollType !== 'open'
  ) {
    return false;
  }

  if (typeof value.question !== 'string') {
    return false;
  }

  if (value.options !== undefined) {
    if (!Array.isArray(value.options) || !value.options.every(isPollOption)) {
      return false;
    }
  }

  if (value.ratingScale !== undefined) {
    if (
      typeof value.ratingScale !== 'number' ||
      !Number.isInteger(value.ratingScale)
    ) {
      return false;
    }
  }

  return true;
}

function isQuizOption(value: unknown): value is QuizQuestion['options'][number] {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.label === 'string';
}

function isQuizQuestion(value: unknown): value is QuizQuestion {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    Array.isArray(value.options) &&
    value.options.every(isQuizOption) &&
    typeof value.correctOptionId === 'string' &&
    typeof value.points === 'number' &&
    Number.isInteger(value.points) &&
    typeof value.timeLimitSec === 'number' &&
    Number.isInteger(value.timeLimitSec)
  );
}

function isQuizConfig(value: unknown): value is QuizConfig {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value.questions) && value.questions.every(isQuizQuestion);
}

function isWordCloudConfig(
  value: unknown,
): value is { prompt: string; maxWordsPerParticipant: number } {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.prompt === 'string' &&
    typeof value.maxWordsPerParticipant === 'number' &&
    Number.isInteger(value.maxWordsPerParticipant)
  );
}

function isFeedbackField(value: unknown): value is FeedbackField {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    (value.type === 'rating' || value.type === 'text') &&
    typeof value.label === 'string'
  );
}

function isFeedbackConfig(value: unknown): value is FeedbackConfig {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.prompt === 'string' &&
    Array.isArray(value.fields) &&
    value.fields.every(isFeedbackField)
  );
}

function isMongoDuplicateKeyError(
  error: unknown,
): error is { code: number; keyPattern?: Record<string, number> } {
  return (
    isRecord(error) &&
    typeof error.code === 'number' &&
    error.code === 11000
  );
}

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel(ResponseEntity.name)
    private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(ParticipantEntity.name)
    private readonly participantModel: Model<ParticipantDocument>,
  ) {}

  async saveResponse(
    activity: ActivityDocument,
    dto: SaveResponseDto,
  ): Promise<ResponseDocument> {
    const config = activity.config;
    const pollType =
      isRecord(config) && typeof config.pollType === 'string'
        ? config.pollType
        : 'single';

    const filter = {
      activityId: new Types.ObjectId(dto.activityId),
      participantAnonId: dto.participantAnonId,
      quizQuestionId: null,
    };

    const setFields: Record<string, unknown> = {
      quizQuestionId: null,
      isCorrect: null,
      awardedPoints: null,
    };

    if (pollType === 'rating') {
      if (dto.ratingValue === undefined) {
        throw new BadRequestException('ratingValue is required for rating polls');
      }
      setFields.ratingValue = dto.ratingValue;
      setFields.selectedOptionIds = [];
      setFields.textValue = null;
      setFields.words = [];
      setFields.feedbackAnswers = [];
    } else if (pollType === 'open') {
      const cleanText = sanitizeText(dto.textValue, 1000);
      if (!cleanText) {
        throw new BadRequestException('textValue is required for open polls');
      }
      setFields.textValue = cleanText;
      setFields.selectedOptionIds = [];
      setFields.ratingValue = null;
      setFields.words = [];
      setFields.feedbackAnswers = [];
    } else {
      if (!dto.selectedOptionIds?.length) {
        throw new BadRequestException(
          'selectedOptionIds is required for choice polls',
        );
      }
      if (pollType === 'single' && dto.selectedOptionIds.length !== 1) {
        throw new BadRequestException(
          'Single-choice polls accept exactly one option',
        );
      }
      setFields.selectedOptionIds = dto.selectedOptionIds;
      setFields.textValue = null;
      setFields.ratingValue = null;
      setFields.words = [];
      setFields.feedbackAnswers = [];
    }

    const response = await this.responseModel
      .findOneAndUpdate(
        filter,
        {
          $set: setFields,
          $setOnInsert: {
            eventId: new Types.ObjectId(dto.eventId),
            activityId: new Types.ObjectId(dto.activityId),
            participantAnonId: dto.participantAnonId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return response as ResponseDocument;
  }

  async saveFeedbackResponse(
    activity: ActivityDocument,
    dto: SaveFeedbackResponseDto,
  ): Promise<ResponseDocument> {
    const config = activity.config;
    if (!isFeedbackConfig(config)) {
      throw new BadRequestException('Activity config is not a valid feedback config');
    }

    if (!dto.feedbackAnswers?.length) {
      throw new BadRequestException('feedbackAnswers is required for feedback activities');
    }

    const fieldMap = new Map(config.fields.map((field) => [field.id, field]));
    const seenFieldIds = new Set<string>();

    const normalizedAnswers = dto.feedbackAnswers.map((answer) => {
      const field = fieldMap.get(answer.fieldId);
      if (!field) {
        throw new BadRequestException(`Unknown feedback field: ${answer.fieldId}`);
      }

      if (seenFieldIds.has(answer.fieldId)) {
        throw new BadRequestException(`Duplicate feedback field: ${answer.fieldId}`);
      }
      seenFieldIds.add(answer.fieldId);

      if (field.type !== answer.type) {
        throw new BadRequestException(
          `Feedback field ${answer.fieldId} must be of type ${field.type}`,
        );
      }

      if (answer.type === 'rating') {
        if (answer.ratingValue === undefined) {
          throw new BadRequestException(
            `ratingValue is required for feedback field ${answer.fieldId}`,
          );
        }

        return {
          fieldId: answer.fieldId,
          type: answer.type,
          ratingValue: answer.ratingValue,
          textValue: null,
        };
      }

      const textValue = sanitizeText(answer.textValue, 1000);
      if (!textValue) {
        throw new BadRequestException(
          `textValue is required for feedback field ${answer.fieldId}`,
        );
      }

      return {
        fieldId: answer.fieldId,
        type: answer.type,
        ratingValue: null,
        textValue,
      };
    });

    const response = await this.responseModel
      .findOneAndUpdate(
        {
          activityId: new Types.ObjectId(dto.activityId),
          participantAnonId: dto.participantAnonId,
          quizQuestionId: null,
        },
        {
          $set: {
            selectedOptionIds: [],
            textValue: null,
            ratingValue: null,
            words: [],
            feedbackAnswers: normalizedAnswers,
            quizQuestionId: null,
            isCorrect: null,
            awardedPoints: null,
          },
          $setOnInsert: {
            eventId: new Types.ObjectId(dto.eventId),
            activityId: new Types.ObjectId(dto.activityId),
            participantAnonId: dto.participantAnonId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return response as ResponseDocument;
  }

  async saveQuizAnswer(
    activity: ActivityDocument,
    dto: SaveQuizAnswerDto,
  ): Promise<ResponseDocument> {
    const config = activity.config;
    if (!isQuizConfig(config)) {
      throw new BadRequestException('Activity config is not a valid quiz config');
    }

    const question = getQuizQuestion(config, dto.questionId);

    if (!question) {
      throw new BadRequestException('Quiz question not found');
    }

    const option = question.options.find((item) => item.id === dto.optionId);
    if (!option) {
      throw new BadRequestException('Quiz option not found');
    }

    if (dto.answeredAt > dto.endsAt) {
      throw new BadRequestException('This quiz question is already closed');
    }

    const existing = await this.responseModel
      .findOne({
        activityId: new Types.ObjectId(dto.activityId),
        participantAnonId: dto.participantAnonId,
        quizQuestionId: dto.questionId,
      })
      .lean()
      .exec();

    if (existing) {
      throw new BadRequestException('You have already answered this question');
    }

    const isCorrect = dto.optionId === question.correctOptionId;
    const awardedPoints = computeQuizPoints({
      question,
      isCorrect,
      endsAt: dto.endsAt,
      now: dto.answeredAt,
      speedBonusEnabled: dto.speedBonusEnabled,
    });

    try {
      return await this.responseModel.create({
        eventId: new Types.ObjectId(dto.eventId),
        activityId: new Types.ObjectId(dto.activityId),
        participantAnonId: dto.participantAnonId,
        selectedOptionIds: [dto.optionId],
        textValue: null,
        ratingValue: null,
        quizQuestionId: dto.questionId,
        isCorrect,
        awardedPoints,
        words: [],
        feedbackAnswers: [],
      });
    } catch (error: unknown) {
      if (isMongoDuplicateKeyError(error)) {
        throw new BadRequestException('You have already answered this question');
      }
      throw error;
    }
  }

  async saveWordCloudResponse(
    activity: ActivityDocument,
    dto: SaveWordCloudResponseDto,
  ): Promise<ResponseDocument> {
    const config = activity.config;
    if (!isWordCloudConfig(config)) {
      throw new BadRequestException(
        'Activity config is not a valid word cloud config',
      );
    }

    const normalizedWords = dto.words
      .map((word) => sanitizeText(word, 80).toLowerCase())
      .filter((word) => word.length > 0);

    if (normalizedWords.length === 0) {
      throw new BadRequestException('At least one valid word is required');
    }

    if (normalizedWords.length > config.maxWordsPerParticipant) {
      throw new BadRequestException(
        `You can submit at most ${config.maxWordsPerParticipant} words`,
      );
    }

    const response = await this.responseModel
      .findOneAndUpdate(
        {
          activityId: new Types.ObjectId(dto.activityId),
          participantAnonId: dto.participantAnonId,
          quizQuestionId: null,
        },
        {
          $set: {
            selectedOptionIds: [],
            textValue: null,
            ratingValue: null,
            words: normalizedWords,
            feedbackAnswers: [],
            quizQuestionId: null,
            isCorrect: null,
            awardedPoints: null,
          },
          $setOnInsert: {
            eventId: new Types.ObjectId(dto.eventId),
            activityId: new Types.ObjectId(dto.activityId),
            participantAnonId: dto.participantAnonId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return response as ResponseDocument;
  }

  async computeTally(
    activityId: string,
    activity: ActivityDocument,
  ): Promise<PollTally> {
    const config = activity.config;
    if (!isPollConfig(config)) {
      throw new BadRequestException('Activity config is not a valid poll config');
    }

    const responses = await this.responseModel
      .find({
        activityId: new Types.ObjectId(activityId),
        quizQuestionId: null,
      })
      .select('selectedOptionIds textValue ratingValue')
      .lean()
      .exec();

    return computePollTally(config, responses);
  }

  async computeWordCloud(activityId: string) {
    return this.responseModel
      .aggregate([
        {
          $match: {
            activityId: new Types.ObjectId(activityId),
            quizQuestionId: null,
          },
        },
        {
          $project: {
            words: {
              $ifNull: ['$words', []],
            },
          },
        },
        { $unwind: '$words' },
        {
          $group: {
            _id: '$words',
            weight: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            text: '$_id',
            weight: 1,
          },
        },
        { $sort: { weight: -1, text: 1 } },
      ])
      .exec() as Promise<Array<{ text: string; weight: number }>>;
  }

  async computeQuizLeaderboard(activityId: string) {
    const leaderboard = await this.responseModel
      .aggregate([
        {
          $match: {
            activityId: new Types.ObjectId(activityId),
            quizQuestionId: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$participantAnonId',
            points: { $sum: { $ifNull: ['$awardedPoints', 0] } },
            eventId: { $first: '$eventId' },
          },
        },
        { $sort: { points: -1, _id: 1 } },
        { $limit: 10 },
      ])
      .exec();

    const anonIds = leaderboard.map((entry) => entry._id as string);
    const eventId = leaderboard[0]?.eventId as Types.ObjectId | undefined;

    const participants = eventId
      ? await this.participantModel
          .find({
            eventId,
            anonId: { $in: anonIds },
          })
          .select('anonId displayName')
          .lean()
          .exec()
      : [];

    const namesByAnonId = new Map(
      participants.map((participant) => [
        participant.anonId,
        participant.displayName?.trim() || 'Anonymous',
      ]),
    );

    return leaderboard.map((entry) => ({
      name: namesByAnonId.get(entry._id as string) ?? 'Anonymous',
      points: entry.points as number,
    }));
  }

  async findByActivity(activityId: string): Promise<ResponseDocument[]> {
    return this.responseModel
      .find({ activityId: new Types.ObjectId(activityId) })
      .lean()
      .exec() as unknown as ResponseDocument[];
  }
}