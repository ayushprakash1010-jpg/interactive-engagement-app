import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubscriptionEntity, SubscriptionDocument } from './subscription.schema';
import { SubscriptionHistoryEntity, SubscriptionHistoryDocument } from './subscription-history.schema';
import { OrganizationEntity, OrganizationDocument } from '../organizations/organization.schema';
import { PlanTier, isValidPlanTier } from './plan-config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(SubscriptionEntity.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(SubscriptionHistoryEntity.name)
    private readonly historyModel: Model<SubscriptionHistoryDocument>,
    @InjectModel(OrganizationEntity.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  /**
   * Gets the active plan tier for an organization.
   * If the org has no active subscription or the orgId is null, returns 'free'.
   */
  async getCurrentPlan(organizationId: string | null | undefined): Promise<PlanTier> {
    if (!organizationId || !Types.ObjectId.isValid(organizationId)) return 'free';

    const sub = await this.subscriptionModel
      .findOne({ organizationId, status: 'active' })
      .select('plan')
      .lean()
      .exec();

    if (sub && isValidPlanTier(sub.plan)) {
      return sub.plan;
    }

    // Two-Phase Migration Fallback:
    // If no subscription is found, fall back to the legacy `plan` field on OrganizationEntity.
    const org = await this.orgModel.findById(organizationId).select('plan').lean().exec();
    if (org && isValidPlanTier(org.plan)) {
      return org.plan;
    }

    return 'free';
  }

  /**
   * Assigns a new plan to an organization.
   * Updates the SubscriptionEntity and logs the change to SubscriptionHistoryEntity.
   */
  async assignPlanToOrg(organizationId: string, newPlan: PlanTier, reason?: string): Promise<void> {
    if (!Types.ObjectId.isValid(organizationId)) return;
    const orgIdObj = new Types.ObjectId(organizationId);

    // Get current subscription to record history
    const currentSub = await this.subscriptionModel.findOne({ organizationId: orgIdObj }).exec();
    const previousPlan = currentSub?.plan ?? 'free';

    // Upsert subscription
    const updatedSub = await this.subscriptionModel.findOneAndUpdate(
      { organizationId: orgIdObj },
      { $set: { plan: newPlan, status: 'active' } },
      { upsert: true, new: true }
    ).exec();

    // Record history
    await this.historyModel.create({
      organizationId: orgIdObj,
      subscriptionId: updatedSub._id,
      previousPlan,
      newPlan,
      reason,
    });

    // Ensure Organization points to this subscription
    await this.orgModel.updateOne(
      { _id: orgIdObj },
      { $set: { subscriptionId: updatedSub._id } }
    ).exec();
  }
}
