/**
 * usage.service.ts
 *
 * Tracks and enforces quota consumption for an organization.
 * Single responsibility: "how much has this org used, and are they over limit?"
 *
 * Uses MongoDB $inc + upsert for atomic counter increments.
 * If the org has no Usage document for the current month yet, one is created.
 */
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsageEntity, UsageDocument } from './usage.schema';
import { SubscriptionService } from './subscription.service';
import { PlanDefinitionService } from './plan-definition.service';

/** YYYY-MM in UTC */
function currentMonth(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export interface MonthlyUsage {
  month: string;
  participantsUsed: number;
  aiRequests: number;
  exports: number;
}

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @InjectModel(UsageEntity.name)
    private readonly usageModel: Model<UsageDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly planDefinitionService: PlanDefinitionService,
  ) {}

  // ── Internal helpers ────────────────────────────────────────────────────────

  private async getOrCreateUsage(
    organizationId: string,
    month: string,
  ): Promise<UsageDocument> {
    return this.usageModel.findOneAndUpdate(
      { organizationId: new Types.ObjectId(organizationId), month },
      { $setOnInsert: { organizationId: new Types.ObjectId(organizationId), month } },
      { upsert: true, new: true },
    ).exec() as unknown as UsageDocument;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Returns the current month's usage for an organization.
   * Returns zeroed usage if no document exists yet.
   */
  async getMonthlyUsage(organizationId: string): Promise<MonthlyUsage> {
    const month = currentMonth();
    const doc = await this.usageModel
      .findOne({ organizationId: new Types.ObjectId(organizationId), month })
      .lean()
      .exec();

    return {
      month,
      participantsUsed: doc?.participantsUsed ?? 0,
      aiRequests: doc?.aiRequests ?? 0,
      exports: doc?.exports ?? 0,
    };
  }

  /**
   * Checks whether the org is under the participant limit for this month.
   * Does NOT increment — call incrementParticipants() after a successful join.
   *
   * Returns { allowed: boolean; used: number; limit: number | null }
   */
  async checkParticipantLimit(organizationId: string | null | undefined): Promise<{
    allowed: boolean;
    used: number;
    limit: number | null;
  }> {
    // Users with no org (solo hosts) are treated as free-plan
    const orgId = organizationId ?? null;
    const planTier = await this.subscriptionService.getCurrentPlan(orgId);
    const config = this.planDefinitionService.getPlanConfig(planTier);
    const limit = config.limits.participantsPerMonth;

    if (limit === null) {
      // Unlimited plan
      return { allowed: true, used: 0, limit: null };
    }

    if (!orgId) {
      // No org → treat solo host as free, count their personal usage
      // For now, solo hosts without orgs are always allowed (edge case)
      return { allowed: true, used: 0, limit };
    }

    const usage = await this.getMonthlyUsage(orgId);
    const allowed = usage.participantsUsed < limit;

    return { allowed, used: usage.participantsUsed, limit };
  }

  /**
   * Atomically increments the participant count for the org's current month.
   * Call this only after a participant successfully joins.
   */
  async incrementParticipants(organizationId: string | null | undefined): Promise<void> {
    if (!organizationId) return;

    const month = currentMonth();
    await this.usageModel.findOneAndUpdate(
      { organizationId: new Types.ObjectId(organizationId), month },
      {
        $inc: { participantsUsed: 1 },
        $setOnInsert: { organizationId: new Types.ObjectId(organizationId), month },
      },
      { upsert: true, new: true },
    ).exec();
  }

  /**
   * Checks and increments AI request usage.
   * Throws ForbiddenException with PLAN_UPGRADE_REQUIRED if over limit.
   */
  async checkAndIncrementAiUsage(organizationId: string | null | undefined): Promise<void> {
    const orgId = organizationId ?? null;
    const planTier = await this.subscriptionService.getCurrentPlan(orgId);
    const config = this.planDefinitionService.getPlanConfig(planTier);
    const limit = config.limits.aiRequestsPerMonth;

    if (limit === null) {
      // Unlimited — just increment and return
      if (orgId) await this._incrementAi(orgId);
      return;
    }

    if (!orgId) {
      // Solo host with free plan — still enforce limit
      // For solo hosts we can't track per-org; skip for MVP
      return;
    }

    const usage = await this.getMonthlyUsage(orgId);

    if (usage.aiRequests >= limit) {
      throw new ForbiddenException({
        code: 'PLAN_UPGRADE_REQUIRED',
        requiredPlan: 'basic',
        message: `AI request limit (${limit}/month) reached. Upgrade your plan to continue.`,
      });
    }

    await this._incrementAi(orgId);
  }

  private async _incrementAi(organizationId: string): Promise<void> {
    const month = currentMonth();
    await this.usageModel.findOneAndUpdate(
      { organizationId: new Types.ObjectId(organizationId), month },
      {
        $inc: { aiRequests: 1 },
        $setOnInsert: { organizationId: new Types.ObjectId(organizationId), month },
      },
      { upsert: true, new: true },
    ).exec();
  }

  /**
   * Increments the export counter and checks the plan's export entitlement.
   * Throws ForbiddenException if exporting is not available on their plan.
   */
  async checkAndIncrementExport(organizationId: string | null | undefined): Promise<void> {
    const orgId = organizationId ?? null;
    const planTier = await this.subscriptionService.getCurrentPlan(orgId);
    const config = this.planDefinitionService.getPlanConfig(planTier);

    if (!config.features.dataExport) {
      throw new ForbiddenException({
        code: 'PLAN_UPGRADE_REQUIRED',
        requiredPlan: 'basic',
        message: 'Data export is not available on the Free plan. Upgrade to Basic or higher.',
      });
    }

    if (orgId) {
      const month = currentMonth();
      await this.usageModel.findOneAndUpdate(
        { organizationId: new Types.ObjectId(orgId), month },
        {
          $inc: { exports: 1 },
          $setOnInsert: { organizationId: new Types.ObjectId(orgId), month },
        },
        { upsert: true, new: true },
      ).exec();
    }
  }
}
