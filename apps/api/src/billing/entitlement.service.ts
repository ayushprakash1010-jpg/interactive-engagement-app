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
import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PlanDefinitionService } from './plan-definition.service';
import { UsageService } from './usage.service';
import type { PlanFeatures, PlanTier } from './plan-config';
import { FeatureKey, PLAN_CONFIGS } from './plan-config';

export interface RichEntitlements {
  plan: PlanTier;
  planDisplayName: string;
  participants: { limit: number | null; used: number; percent: number };
  ai: { limit: number | null; used: number; percent: number };
  features: Record<FeatureKey, { enabled: boolean; requiredPlan?: PlanTier }>;
  isUnassigned: boolean;
}

@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);
  
  // Cache of boolean features for fast Guard evaluation
  // Map of organizationId -> { data: Record<FeatureKey, boolean>, expiresAt: number }
  private cache = new Map<string, { data: Record<FeatureKey, boolean>; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly planDefinitionService: PlanDefinitionService,
    private readonly usageService: UsageService,
  ) {}

  /**
   * Resolves the complete rich entitlement set for an organization.
   * Merges plan configuration with current usage.
   *
   * @param organizationId - The org's ObjectId string
   */
  async getRichEntitlements(organizationId: string | null | undefined): Promise<RichEntitlements> {
    const planTier = await this.subscriptionService.getCurrentPlan(organizationId);
    const config = this.planDefinitionService.getPlanConfig(planTier);
    
    let participantsUsed = 0;
    let aiUsed = 0;
    
    if (organizationId) {
      const usage = await this.usageService.getMonthlyUsage(organizationId);
      participantsUsed = usage.participantsUsed;
      aiUsed = usage.aiRequests;
    }

    const participantsLimit = config.limits.participantsPerMonth;
    const aiLimit = config.limits.aiRequestsPerMonth;

    const participantsPercent = participantsLimit ? Math.min(100, Math.round((participantsUsed / participantsLimit) * 100)) : 0;
    const aiPercent = aiLimit ? Math.min(100, Math.round((aiUsed / aiLimit) * 100)) : 0;

    // Map each feature to its enabled state, and if not enabled, its required plan
    const featuresResponse = {} as Record<FeatureKey, { enabled: boolean; requiredPlan?: PlanTier }>;
    
    for (const key of Object.values(FeatureKey)) {
      const isEnabled = config.features[key as FeatureKey];
      
      let requiredPlan: PlanTier | undefined = undefined;
      if (!isEnabled) {
        // Find the lowest plan that has this feature
        if (PLAN_CONFIGS.basic.features[key as FeatureKey]) requiredPlan = 'basic';
        else if (PLAN_CONFIGS.pro.features[key as FeatureKey]) requiredPlan = 'pro';
        else if (PLAN_CONFIGS.enterprise.features[key as FeatureKey]) requiredPlan = 'enterprise';
      }

      featuresResponse[key as FeatureKey] = {
        enabled: isEnabled,
        requiredPlan,
      };
    }

    return {
      plan: config.tier,
      planDisplayName: config.displayName,
      participants: { limit: participantsLimit, used: participantsUsed, percent: participantsPercent },
      ai: { limit: aiLimit, used: aiUsed, percent: aiPercent },
      features: featuresResponse,
      isUnassigned: !organizationId,
    };
  }

  /**
   * Checks a single feature entitlement (used by Guards).
   * Uses an in-memory cache to avoid repeated DB calls on every request.
   */
  async canUse(
    organizationId: string | null | undefined,
    feature: keyof PlanFeatures,
  ): Promise<boolean> {
    if (!organizationId) {
      const config = this.planDefinitionService.getPlanConfig('free');
      return config.features[feature];
    }

    const now = Date.now();
    const cached = this.cache.get(organizationId);

    if (cached && cached.expiresAt > now) {
      return cached.data[feature];
    }

    // Cache miss or expired
    const planTier = await this.subscriptionService.getCurrentPlan(organizationId);
    const config = this.planDefinitionService.getPlanConfig(planTier);
    this.cache.set(organizationId, {
      data: config.features,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return config.features[feature];
  }

  /**
   * Invalidates the cache for a specific organization.
   * Should be called when an admin updates their plan.
   */
  invalidateCache(organizationId: string) {
    this.cache.delete(organizationId);
    this.logger.log(`Invalidated entitlement cache for org ${organizationId}`);
  }
}

