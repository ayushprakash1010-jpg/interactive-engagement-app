import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResponseDocument = HydratedDocument<ResponseEntity>;

@Schema({ timestamps: true, collection: 'responses' })
export class ResponseEntity {
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

  @Prop({ type: [String], default: [] })
  selectedOptionIds!: string[];

  @Prop({ type: String, default: null })
  textValue!: string | null;

  @Prop({ type: Number, default: null })
  ratingValue!: number | null;

  @Prop({ type: String, default: null })
  quizQuestionId!: string | null;

  @Prop({ type: Boolean, default: null })
  isCorrect!: boolean | null;

  @Prop({ type: Number, default: null })
  awardedPoints!: number | null;
}

export const ResponseSchema = SchemaFactory.createForClass(ResponseEntity);

ResponseSchema.index({ eventId: 1, activityId: 1 });