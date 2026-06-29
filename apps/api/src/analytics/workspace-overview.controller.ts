import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AnalyticsService } from './analytics.service';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceOverviewController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getWorkspaceOverview(user);
  }
}
