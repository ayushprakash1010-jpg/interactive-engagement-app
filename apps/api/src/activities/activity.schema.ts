// apps/api/src/activities/activity.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ActivityDocument = HydratedDocument<ActivityEntity>;

// ── Poll config subdocument ───────────────────────────────────────────────────

class PollOption {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  label!: string;
}

class PollConfig {
  @Prop({ required: true, enum: ['single', 'multiple', 'rating', 'open'] })
  pollType!: 'single' | 'multiple' | 'rating' | 'open';

  @Prop({ required: true })
  question!: string;

  @Prop({ type: [{ id: String, label: String }], default: [] })
  options!: PollOption[];

  @Prop({ min: 2, max: 10 })
  ratingScale?: number;
}

// ── Activity entity ───────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'activities' })
export class ActivityEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'EventEntity',
    required: true,
    index: true,
  })
  eventId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['poll', 'quiz', 'wordcloud', 'feedback'],
  })
  type!: 'poll' | 'quiz' | 'wordcloud' | 'feedback';

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, default: 0, min: 0 })
  order!: number;

  @Prop({
    required: true,
    enum: ['idle', 'live', 'closed'],
    default: 'idle',
  })
  status!: 'idle' | 'live' | 'closed';

  // Stored as a flexible Mixed type to support all activity config shapes.
  // Validated at the service layer via Zod before persistence.
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  config!: PollConfig | Record<string, unknown>;
}

export const ActivityEntitySchema =
  SchemaFactory.createForClass(ActivityEntity);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Efficient listing and reorder operations per event
ActivityEntitySchema.index({ eventId: 1, order: 1 });
// Fast single-activity lookup scoped to an event
ActivityEntitySchema.index({ eventId: 1, _id: 1 });
// Finding the currently live activity for a session snapshot
ActivityEntitySchema.index({ eventId: 1, status: 1 });