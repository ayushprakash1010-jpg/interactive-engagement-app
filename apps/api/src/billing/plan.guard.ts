/**
 * plan.guard.ts
 *
 * A reusable NestJS guard + decorator pair for plan-level feature gating.
 *
 * Usage on any controller route:
 *   @RequiresEntitlement('qaModeration')
 *   @Patch(':id/settings')
 *   async updateSettings(...) { ... }
 *
 * If the org lacks the entitlement, returns:
 *   HTTP 403 { code: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'pro', feature: 'qaModeration' }
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { EntitlementService } from './entitlement.service';
import { FeatureKey, PLAN_CONFIGS } from './plan-config';

/** Metadata key used to attach the required feature to a route handler */
export const ENTITLEMENT_KEY = 'requiredEntitlement';

/**
 * Decorator: marks a route as requiring a specific plan feature.
 * Apply AFTER @UseGuards(JwtAuthGuard, PlanGuard).
 *
 * @example
 * @RequiresEntitlement(FeatureKey.QA_MODERATION)
 */
export const RequiresEntitlement = (feature: FeatureKey) =>
  SetMetadata(ENTITLEMENT_KEY, feature);

/** Maps each feature to the minimum plan that enables it (for the error response) */
const FEATURE_TO_MIN_PLAN: Record<FeatureKey, string> = {
  [FeatureKey.QA_MODERATION]: 'pro',
  [FeatureKey.CUSTOM_BRANDING]: 'pro',
  [FeatureKey.ADVANCED_ANALYTICS]: 'pro',
  [FeatureKey.DATA_EXPORT]: 'basic',
  [FeatureKey.PRIORITY_SUPPORT]: 'enterprise',
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlementService: EntitlementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<FeatureKey | undefined>(
      ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No entitlement requirement on this route — pass through
    if (!feature) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as { organizationId?: string } | undefined;

    const allowed = await this.entitlementService.canUse(user?.organizationId, feature);

    if (!allowed) {
      throw new ForbiddenException({
        code: 'PLAN_UPGRADE_REQUIRED',
        feature,
        requiredPlan: FEATURE_TO_MIN_PLAN[feature] ?? 'pro',
        message: `Your current plan does not include ${feature}. Upgrade to unlock this feature.`,
      });
    }

    return true;
  }
}
