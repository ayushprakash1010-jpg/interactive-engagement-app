import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SurveySessionDocument = HydratedDocument<SurveySessionEntity>;

@Schema({ timestamps: true, collection: 'survey_sessions' })
export class SurveySessionEntity {
  @Prop({ type: Types.ObjectId, ref: 'EventEntity', required: true, index: true })
  eventId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ActivityEntity',
    required: true,
    index: true,
  })
  activityId!: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  participantAnonId!: string;

  @Prop({
    required: true,
    enum: ['started', 'completed'],
    default: 'started',
  })
  status!: 'started' | 'completed';

  @Prop({ type: Date, required: true, default: Date.now })
  startedAt!: Date;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;
}

export const SurveySessionSchema = SchemaFactory.createForClass(SurveySessionEntity);

// Ensure a participant can only have one session per survey activity
SurveySessionSchema.index({ activityId: 1, participantAnonId: 1 }, { unique: true });
