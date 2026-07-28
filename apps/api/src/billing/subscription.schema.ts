/**
 * subscription.schema.ts
 *
 * Dedicated Subscription collection to track organization plans, payment status,
 * trials, and provider IDs (like Stripe).
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PlanTier } from './plan-config';

export type SubscriptionDocument = HydratedDocument<SubscriptionEntity>;

export type SubscriptionStatus = 'active' | 'canceled' | 'trialing' | 'past_due' | 'unpaid';

@Schema({ timestamps: true, collection: 'subscriptions' })
export class SubscriptionEntity {
  /** The organization this subscription belongs to. */
  @Prop({
    type: Types.ObjectId,
    ref: 'OrganizationEntity',
    required: true,
    index: true,
    unique: true,
  })
  organizationId!: Types.ObjectId;

  /** The plan tier assigned to this subscription. */
  @Prop({ type: String, required: true, default: 'free', trim: true })
  plan!: PlanTier;

  /** Current state of the subscription. */
  @Prop({ type: String, required: true, default: 'active', trim: true })
  status!: SubscriptionStatus;

  /** When the subscription will renew or end. */
  @Prop({ type: Date, default: null })
  renewalDate?: Date | null;

  /** When the trial period ends, if applicable. */
  @Prop({ type: Date, default: null })
  trialEnds?: Date | null;

  /** The billing provider (e.g., 'stripe'). */
  @Prop({ type: String, trim: true, default: null })
  provider?: string | null;

  /** Provider's customer ID. */
  @Prop({ type: String, trim: true, default: null, index: true })
  providerCustomerId?: string | null;

  /** Provider's subscription ID. */
  @Prop({ type: String, trim: true, default: null, index: true })
  providerSubscriptionId?: string | null;
}

export const SubscriptionEntitySchema = SchemaFactory.createForClass(SubscriptionEntity);
