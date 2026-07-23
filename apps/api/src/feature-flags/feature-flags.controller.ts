import { Controller, Get, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('feature-flags')
@UseGuards(JwtAuthGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get('evaluate')
  evaluateForUser(@CurrentUser() user: AuthenticatedUser) {
    // This evaluates the in-memory cache directly (0 database queries)
    // Returns a safe key-value map: { 'ai-studio': true }
    return this.featureFlagsService.evaluateAllForUser(user.organizationId);
  }
}
