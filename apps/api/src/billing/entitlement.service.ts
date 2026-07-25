/**
 * entitlement.service.ts
 *
 * Single source of truth for "what can this org do right now?"
 *
 * Returns a unified Entitlements object consumed identically by:
 *  - Backend: PlanGuard, route-level feature checks
 *  - Frontend: usePlan() hook, <UpgradeGate> component
 *
 * This avoids duplicated feature-gate logic scattered across services.
 */
import { Injectable } from '@nestjs/common';
import { PlanService } from './plan.service';
import type { PlanFeatures, PlanTier } from './plan-config';

export interface Entitlements extends PlanFeatures {
  /** The resolved plan tier for UI display */
  plan: PlanTier;
  /** Human-readable display name */
  planDisplayName: string;
}

@Injectable()
export class EntitlementService {
  constructor(private readonly planService: PlanService) {}

  /**
   * Resolves the complete entitlement set for an organization.
   *
   * @param organizationId - The org's ObjectId string (or null for solo hosts)
   * @returns A flat Entitlements object. All feature keys are booleans.
   */
  async getEntitlements(organizationId: string | null | undefined): Promise<Entitlements> {
    const config = await this.planService.getPlanConfigForOrg(organizationId);

    return {
      plan: config.tier,
      planDisplayName: config.displayName,
      ...config.features,
    };
  }

  /**
   * Checks a single feature entitlement.
   * Useful for programmatic inline checks without a full guard.
   */
  async canUse(
    organizationId: string | null | undefined,
    feature: keyof PlanFeatures,
  ): Promise<boolean> {
    const config = await this.planService.getPlanConfigForOrg(organizationId);
    return config.features[feature];
  }
}
