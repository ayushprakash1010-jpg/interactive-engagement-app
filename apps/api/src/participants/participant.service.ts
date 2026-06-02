// apps/api/src/participants/participant.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ParticipantEntity, ParticipantDocument } from './participant.schema';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(
    @InjectModel(ParticipantEntity.name)
    private readonly participantModel: Model<ParticipantDocument>,
  ) {}

  // ── Upsert ────────────────────────────────────────────────────────────────

  /**
   * Creates a participant document for the given (eventId, anonId) pair
   * if one does not exist, or updates `displayName` and re-marks them
   * as connected if they are rejoining after a disconnect.
   *
   * Safe to call on every socket reconnect — the unique compound index
   * on { eventId, anonId } prevents duplicate documents.
   */
  async upsertParticipant(
    eventId: string,
    anonId: string,
    displayName?: string,
  ): Promise<ParticipantDocument> {
    const eventObjectId = new Types.ObjectId(eventId);

    const setFields: Record<string, unknown> = { connected: true };
    if (displayName !== undefined) {
      setFields.displayName = displayName.trim();
    }

    const participant = await this.participantModel
      .findOneAndUpdate(
        { eventId: eventObjectId, anonId },
        {
          $set: setFields,
          $setOnInsert: {
            eventId: eventObjectId,
            anonId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )
      .exec();

    return participant as ParticipantDocument;
  }

  // ── Mark disconnected ─────────────────────────────────────────────────────

  /**
   * Flips `connected` to false when the participant's socket disconnects.
   * Does nothing if the document does not exist (handles race conditions
   * where disconnect fires before the upsert completes).
   */
  async markDisconnected(eventId: string, anonId: string): Promise<void> {
    const eventObjectId = new Types.ObjectId(eventId);

    const result = await this.participantModel
      .updateOne(
        { eventId: eventObjectId, anonId },
        { $set: { connected: false } },
      )
      .exec();

    if (result.matchedCount === 0) {
      this.logger.warn(
        `markDisconnected: no participant found for event=${eventId} anonId=${anonId}`,
      );
    }
  }

  // ── Count connected ───────────────────────────────────────────────────────

  /**
   * Returns the number of participants currently connected to an event.
   * Used by the RealtimeGateway to broadcast `participant:count`.
   */
  async countConnected(eventId: string): Promise<number> {
    return this.participantModel
      .countDocuments({
        eventId: new Types.ObjectId(eventId),
        connected: true,
      })
      .exec();
  }
}
