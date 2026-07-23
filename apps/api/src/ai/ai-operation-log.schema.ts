import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiOperationLogDocument = AiOperationLogEntity & Document;

@Schema({ timestamps: true, collection: 'ai_operations' })
export class AiOperationLogEntity {
  @Prop({ type: Types.ObjectId, required: true, ref: 'UserEntity', index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OrganizationEntity', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  featureName!: string;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  model!: string;

  @Prop({ required: true, index: true })
  status!: 'success' | 'failure' | 'throttled';

  @Prop()
  errorMessage?: string;

  @Prop()
  latencyMs?: number;

  @Prop()
  promptTokens?: number;

  @Prop()
  completionTokens?: number;

  @Prop()
  totalTokens?: number;

  @Prop({ type: Date, expires: '90d', default: Date.now })
  createdAt!: Date;
}

export const AiOperationLogSchema = SchemaFactory.createForClass(AiOperationLogEntity);
