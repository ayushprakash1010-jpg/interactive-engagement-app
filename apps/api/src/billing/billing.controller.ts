/**
 * billing.controller.ts
 *
 * Exposes plan/usage/entitlement data to the frontend.
 * All routes require a valid JWT (JwtAuthGuard).
 *
 * Routes:
 *   GET /billing/entitlements   — what features can the current user's org use
 *   GET /billing/usage          — current month's usage counters + limits
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { EntitlementService } from './entitlement.service';
import { UsageService } from './usage.service';
import { PlanService } from './plan.service';
import type { PlanTier } from './plan-config';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly entitlementService: EntitlementService,
    private readonly usageService: UsageService,
    private readonly planService: PlanService,
  ) {}

  /**
   * GET /billing/entitlements
   * Returns the org's complete entitlement object.
   * Frontend usePlan() hook calls this.
   */
  @Get('entitlements')
  async getEntitlements(@CurrentUser() user: AuthenticatedUser) {
    return this.entitlementService.getEntitlements(user.organizationId);
  }

  /**
   * GET /billing/usage
   * Returns current month's usage counters alongside plan limits.
   * Used to render usage meters on the billing/account pages.
   */
  @Get('usage')
  async getUsage(@CurrentUser() user: AuthenticatedUser) {
    const orgId = user.organizationId ?? null;

    // Get usage (zeroes if no doc yet)
    const usage = orgId
      ? await this.usageService.getMonthlyUsage(orgId)
      : { month: '', participantsUsed: 0, aiRequests: 0, exports: 0 };

    // Get plan config for limits
    const tier: PlanTier = await this.planService.getEffectivePlan(orgId);
    const config = this.planService.getPlanConfig(tier);

    return {
      month: usage.month,
      plan: tier,
      planDisplayName: config.displayName,
      usage: {
        participantsUsed: usage.participantsUsed,
        aiRequests: usage.aiRequests,
        exports: usage.exports,
      },
      limits: {
        participantsPerMonth: config.limits.participantsPerMonth,
        aiRequestsPerMonth: config.limits.aiRequestsPerMonth,
      },
    };
  }
}
