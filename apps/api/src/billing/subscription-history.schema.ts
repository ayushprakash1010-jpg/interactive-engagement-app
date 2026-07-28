import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PlanTier } from './plan-config';

export type SubscriptionHistoryDocument = HydratedDocument<SubscriptionHistoryEntity>;

@Schema({ timestamps: true, collection: 'subscription_history' })
export class SubscriptionHistoryEntity {
  @Prop({ type: Types.ObjectId, required: true, index: true, ref: 'OrganizationEntity' })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true, ref: 'SubscriptionEntity' })
  subscriptionId!: Types.ObjectId;

  @Prop({ required: true })
  previousPlan!: string; // string or PlanTier (string allows migration tracking if coming from legacy)

  @Prop({ type: String, required: true })
  newPlan!: PlanTier;

  // Optional: record who made the change or why
  @Prop({ required: false })
  reason?: string;
}

export const SubscriptionHistoryEntitySchema = SchemaFactory.createForClass(SubscriptionHistoryEntity);
