// apps/api/src/events/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type EventDocument = HydratedDocument<EventEntity>;

/**
 * Embedded settings sub-document.
 * Not a separate collection — stored inline inside each event.
 *
 * FIX: Added @Schema({ _id: false }) so that:
 *  1. @nestjs/mongoose's SchemaFactory can collect @Prop() metadata correctly.
 *  2. Mongoose does not inject an unwanted _id into the settings subdoc.
 *     (Without this, only the _id was being saved; all three boolean fields
 *      were silently dropped, making requireModeration always read as undefined → false.)
 */
@Schema({ _id: false })
class EventSettingsSubdoc {
  @Prop({ default: true })
  allowAnonymousQA!: boolean;

  @Prop({ default: false })
  requireModeration!: boolean;

  @Prop({ default: false })
  participantNames!: boolean;
}

const EventSettingsSchema = SchemaFactory.createForClass(EventSettingsSubdoc);

@Schema({ _id: false })
export class EventIntegrationSubdoc {
  @Prop({ required: true, enum: ['zoom', 'teams', 'webex', 'meet', 'powerpoint'] })
  provider!: string;

  @Prop({ required: true })
  externalId!: string;
}

const EventIntegrationSchema = SchemaFactory.createForClass(EventIntegrationSubdoc);

@Schema({ timestamps: true, collection: 'events' })
export class EventEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserEntity',
    required: true,
    index: true,
  })
  hostId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  /**
   * 6-char alphanumeric code used by participants to join.
   * Generated server-side with collision retry; unique index enforced here
   * and also declared programmatically below for the retry-on-collision pattern.
   */
  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    minlength: 6,
    maxlength: 6,
  })
  eventCode!: string;

  @Prop({
    required: true,
    enum: ['draft', 'live', 'ended'],
    default: 'draft',
  })
  status!: 'draft' | 'live' | 'ended';

  @Prop({ type: EventSettingsSchema, default: () => ({}) })
  settings!: EventSettingsSubdoc;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ActivityEntity',
    default: null,
  })
  activeActivityId!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  startedAt!: Date | null;

  @Prop({ type: Date, default: null })
  endedAt!: Date | null;

  @Prop({ type: Date, default: null })
  scheduledStart?: Date | null;

  @Prop({ type: Date, default: null })
  scheduledEnd?: Date | null;

  @Prop({ type: String, default: null })
  timezone?: string | null;

  @Prop({ type: [EventIntegrationSchema], default: [] })
  integrations!: EventIntegrationSubdoc[];
}

export const EventEntitySchema = SchemaFactory.createForClass(EventEntity);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Unique index on eventCode — also the collision-detection mechanism in EventsService
EventEntitySchema.index({ eventCode: 1 }, { unique: true });
// Efficient host event listing (newest first)
EventEntitySchema.index({ hostId: 1, createdAt: -1 });