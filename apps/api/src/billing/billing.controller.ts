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

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly entitlementService: EntitlementService,
  ) {}

  /**
   * GET /billing/entitlements
   * Returns the org's complete entitlement object (Rich Entitlements).
   * Frontend usePlan() hook calls this.
   */
  @Get('entitlements')
  async getEntitlements(@CurrentUser() user: AuthenticatedUser) {
    return this.entitlementService.getRichEntitlements(user.organizationId);
  }

}
