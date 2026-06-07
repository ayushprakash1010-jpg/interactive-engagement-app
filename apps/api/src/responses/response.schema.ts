import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResponseDocument = HydratedDocument<ResponseEntity>;

class FeedbackAnswer {
  @Prop({ type: String, required: true })
  fieldId!: string;

  @Prop({ type: String, required: true, enum: ['rating', 'text'] })
  type!: 'rating' | 'text';

  @Prop({ type: Number, default: null })
  ratingValue!: number | null;

  @Prop({ type: String, default: null })
  textValue!: string | null;
}

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

  @Prop({ type: String, default: null, index: true })
  quizQuestionId!: string | null;

  @Prop({ type: Boolean, default: null })
  isCorrect!: boolean | null;

  @Prop({ type: Number, default: null })
  awardedPoints!: number | null;

  @Prop({ type: [String], default: [] })
  words!: string[];

  @Prop({
    type: [
      {
        fieldId: { type: String, required: true },
        type: { type: String, required: true, enum: ['rating', 'text'] },
        ratingValue: { type: Number, default: null },
        textValue: { type: String, default: null },
      },
    ],
    default: [],
  })
  feedbackAnswers!: FeedbackAnswer[];
}

export const ResponseSchema = SchemaFactory.createForClass(ResponseEntity);

ResponseSchema.index({ eventId: 1, activityId: 1 });

ResponseSchema.index(
  { activityId: 1, participantAnonId: 1 },
  {
    unique: true,
    partialFilterExpression: { quizQuestionId: null },
    name: 'uniq_non_quiz_response_per_participant',
  },
);

ResponseSchema.index(
  { activityId: 1, participantAnonId: 1, quizQuestionId: 1 },
  {
    unique: true,
    partialFilterExpression: { quizQuestionId: { $type: 'string' } },
    name: 'uniq_quiz_question_response_per_participant',
  },
);