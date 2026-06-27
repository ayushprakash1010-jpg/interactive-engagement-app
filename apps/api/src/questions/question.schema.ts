import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionStatus = 'pending' | 'approved' | 'answered' | 'dismissed';

export type QuestionDocument = HydratedDocument<QuestionEntity>;

@Schema({ timestamps: true, collection: 'questions' })
export class QuestionEntity {
  @Prop({
    type: Types.ObjectId,
    ref: 'EventEntity',
    required: true,
    index: true,
  })
  eventId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  })
  text!: string;

  @Prop({
    type: String,
    required: true,
    index: true,
    trim: true,
  })
  authorAnonId!: string;

  @Prop({
    type: String,
    default: null,
    trim: true,
  })
  authorName!: string | null;

  @Prop({
    type: String,
    default: null,
    trim: true,
    maxlength: 4000,
  })
  answerText!: string | null;

  @Prop({
    type: Date,
    default: null,
  })
  answeredAt!: Date | null;

  @Prop({
    type: Number,
    default: 0,
  })
  voteCount!: number;

  @Prop({
    type: [String],
    default: [],
  })
  voterAnonIds!: string[];

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'answered', 'dismissed'],
    default: 'pending',
    index: true,
  })
  status!: QuestionStatus;
}

export const QuestionEntitySchema = SchemaFactory.createForClass(QuestionEntity);

QuestionEntitySchema.index({ eventId: 1, status: 1 });
QuestionEntitySchema.index({ eventId: 1, voteCount: -1, createdAt: -1 });
