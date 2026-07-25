/**
 * usage.schema.ts
 *
 * Dedicated Usage collection — one document per organization per calendar month.
 * Storing usage here (not on UserEntity) means we can add new quota types
 * (exports, storage, API calls, recordings…) without touching the User schema.
 *
 * Key: { organizationId, month }  ← compound unique index
 * month format: "2025-07"  (YYYY-MM, UTC)
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsageDocument = HydratedDocument<UsageEntity>;

@Schema({ timestamps: true, collection: 'usage' })
export class UsageEntity {
  /** The organization this usage record belongs to. */
  @Prop({
    type: Types.ObjectId,
    ref: 'OrganizationEntity',
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  /**
   * Calendar month in "YYYY-MM" format (UTC).
   * One document per org per month.
   */
  @Prop({ required: true, trim: true, index: true })
  month!: string;

  /** Total unique participant joins in this month (across all events). */
  @Prop({ default: 0, min: 0 })
  participantsUsed!: number;

  /** Total AI generation requests in this month. */
  @Prop({ default: 0, min: 0 })
  aiRequests!: number;

  /** Total data export operations in this month. */
  @Prop({ default: 0, min: 0 })
  exports!: number;
}

export const UsageEntitySchema = SchemaFactory.createForClass(UsageEntity);

// Compound unique index: one document per org per month
UsageEntitySchema.index({ organizationId: 1, month: 1 }, { unique: true });
