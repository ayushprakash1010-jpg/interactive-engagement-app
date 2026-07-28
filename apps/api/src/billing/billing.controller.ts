/**
 * billing.controller.ts
 *
 * Exposes plan/usage/entitlement data to the frontend.
 * All routes require a valid JWT (JwtAuthGuard).
 *
 * Routes:
 *   GET /billing/entitlements   — what features can the current user's org use
 *   POST /billing/upgrade-mock  — dev/demo endpoint to simulate a plan upgrade
 *                                 without Stripe. Replace with Stripe webhook handler
 *                                 when payment is integrated.
 */
import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { EntitlementService } from './entitlement.service';
import { SubscriptionService } from './subscription.service';
import { isValidPlanTier, type PlanTier } from './plan-config';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly entitlementService: EntitlementService,
    private readonly subscriptionService: SubscriptionService,
  ) { }

  /**
   * GET /billing/entitlements
   * Returns the org's complete entitlement object (Rich Entitlements).
   * Frontend usePlan() hook calls this.
   */
  @Get('entitlements')
  async getEntitlements(@CurrentUser() user: AuthenticatedUser) {
    return this.entitlementService.getRichEntitlements(user.organizationId);
  }

  /**
   * POST /billing/upgrade-mock
   *
   * Developer / demo endpoint. Simulates a plan upgrade without Stripe.
   * When Stripe is integrated, replace this with the Stripe webhook handler
   * that calls SubscriptionService.assignPlanToOrg() on payment success.
   *
   * Flow:
   *  1. Validate plan tier
   *  2. Assign plan via SubscriptionService (writes DB + history)
   *  3. Invalidate entitlement cache for immediate effect
   *  4. Return fresh entitlements so the frontend can update without reload
   */
  @Post('upgrade-mock')
  async upgradeMock(
    @CurrentUser() user: AuthenticatedUser,
    @Body('plan') plan: string,
  ) {
    if (!plan || !isValidPlanTier(plan)) {
      throw new BadRequestException(
        `Invalid plan tier: '${plan}'. Must be one of: free, basic, pro, enterprise`,
      );
    }

    if (!user.organizationId) {
      throw new BadRequestException('User does not belong to an organization.');
    }

    await this.subscriptionService.assignPlanToOrg(
      user.organizationId,
      plan as PlanTier,
      'Mock upgrade via Billing Dashboard (pre-Stripe)',
    );

    // Invalidate immediately so next GET /billing/entitlements returns fresh data
    this.entitlementService.invalidateCache(user.organizationId);

    // Return fresh entitlements so the frontend doesn't need a page reload
    const entitlements = await this.entitlementService.getRichEntitlements(user.organizationId);
    return { success: true, plan, entitlements };
  }
}

