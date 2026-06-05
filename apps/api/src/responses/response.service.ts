// apps/api/src/responses/response.service.ts
import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseEntity, ResponseDocument } from './response.schema';
import { ActivityDocument } from '../activities/activity.schema';
import { computePollTally, PollTally } from '../activities/utils/tally.util';

export interface SaveResponseDto {
  activityId: string;
  eventId: string;
  participantAnonId: string;
  selectedOptionIds?: string[];
  textValue?: string;
  ratingValue?: number;
}

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);

  constructor(
    @InjectModel(ResponseEntity.name)
    private readonly responseModel: Model<ResponseDocument>,
  ) {}

  // ── Save response with duplicate enforcement ──────────────────────────────

  /**
   * Persists a participant response and enforces poll-type-specific
   * duplicate rules:
   *
   *   single  → upsert (one doc per anonId per activity)
   *   rating  → upsert (one doc per anonId per activity)
   *   open    → upsert (one submission per anonId per activity)
   *   multiple → upsert with $set on selectedOptionIds (replace, not append)
   *
   * All four types use the unique index on { activityId, participantAnonId }
   * as the conflict key. The difference is only whether we allow re-submission
   * (multiple) or silently replace (single/rating/open).
   */
  async saveResponse(
    activity: ActivityDocument,
    dto: SaveResponseDto,
  ): Promise<ResponseDocument> {
    const config = activity.config as any;
    const pollType: string = config?.pollType ?? 'single';

    const filter = {
      activityId: new Types.ObjectId(dto.activityId),
      participantAnonId: dto.participantAnonId,
    };

    // Build the fields to set based on poll type
    const setFields: Record<string, unknown> = {};

    if (pollType === 'rating') {
      if (dto.ratingValue === undefined) {
        throw new BadRequestException('ratingValue is required for rating polls');
      }
      setFields.ratingValue = dto.ratingValue;

    } else if (pollType === 'open') {
      if (!dto.textValue?.trim()) {
        throw new BadRequestException('textValue is required for open polls');
      }
      setFields.textValue = dto.textValue.trim();

    } else {
      // single or multiple
      if (!dto.selectedOptionIds?.length) {
        throw new BadRequestException(
          'selectedOptionIds is required for choice polls',
        );
      }
      // Single-choice polls accept exactly one option — reject attempts to
      // inflate multiple buckets from one submission. (Duplicate submissions by
      // the same anonId are already blocked by the unique index + upsert below.)
      if (pollType === 'single' && dto.selectedOptionIds.length !== 1) {
        throw new BadRequestException(
          'Single-choice polls accept exactly one option',
        );
      }
      setFields.selectedOptionIds = dto.selectedOptionIds;
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

  // ── Compute tally ─────────────────────────────────────────────────────────

  /**
   * Fetches all responses for an activity and computes the tally.
   * Called after every saveResponse() — the result is broadcast to the room.
   */
  async computeTally(
    activityId: string,
    activity: ActivityDocument,
  ): Promise<PollTally> {
    const responses = await this.responseModel
      .find({ activityId: new Types.ObjectId(activityId) })
      .select('selectedOptionIds textValue ratingValue')
      .lean()
      .exec();

    return computePollTally(activity.config as any, responses as any);
  }

  // ── Fetch all responses for an activity (used by tally on reconnect) ─────

  async findByActivity(activityId: string): Promise<ResponseDocument[]> {
    return this.responseModel
      .find({ activityId: new Types.ObjectId(activityId) })
      .lean()
      .exec() as unknown as ResponseDocument[];
  }
}