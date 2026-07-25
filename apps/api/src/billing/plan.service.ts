/**
 * plan.service.ts
 *
 * Resolves the effective plan for an organization and exposes
 * the static PlanConfig for that tier.
 *
 * Single responsibility: "what plan is this org on right now?"
 * All other services (usage, entitlement) depend on this.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationEntity, OrganizationDocument } from '../organizations/organization.schema';
import {
  type PlanTier,
  type PlanConfig,
  PLAN_CONFIGS,
  isValidPlanTier,
} from './plan-config';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(
    @InjectModel(OrganizationEntity.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  /**
   * Resolves the current plan tier for an organization.
   * Falls back to 'free' if the org doesn't exist or has no plan set.
   */
  async getEffectivePlan(organizationId: string | null | undefined): Promise<PlanTier> {
    if (!organizationId) return 'free';
    if (!Types.ObjectId.isValid(organizationId)) return 'free';

    try {
      const org = await this.orgModel
        .findById(organizationId)
        .select('plan')
        .lean()
        .exec();

      if (!org) return 'free';

      const plan = org.plan;
      return isValidPlanTier(plan) ? plan : 'free';
    } catch (err) {
      this.logger.error(`Failed to resolve plan for org ${organizationId}`, err);
      return 'free'; // fail-open to free
    }
  }

  /**
   * Returns the static PlanConfig for a given tier.
   * Callers don't need to import PLAN_CONFIGS directly.
   */
  getPlanConfig(tier: PlanTier): PlanConfig {
    return PLAN_CONFIGS[tier];
  }

  /**
   * Returns the PlanConfig for an organization, resolving its plan first.
   */
  async getPlanConfigForOrg(organizationId: string | null | undefined): Promise<PlanConfig> {
    const tier = await this.getEffectivePlan(organizationId);
    return this.getPlanConfig(tier);
  }
}
