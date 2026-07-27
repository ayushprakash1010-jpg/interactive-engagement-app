import {
  Controller,
  Get,
  Param,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsExportService } from './analytics-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { PlanGuard, RequiresEntitlement } from '../billing/plan.guard';
import { UsageService } from '../billing/usage.service';
import { FeatureKey } from '../billing/plan-config';

@Controller('events/:eventId')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsExportService: AnalyticsExportService,
    private readonly usageService: UsageService,
  ) {}

  @Get('analytics')
  async getAnalytics(
    @Param('eventId') eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.analyticsService.getAnalytics(eventId, user);
  }

  @Get('report.csv')
  @UseGuards(PlanGuard)
  @RequiresEntitlement(FeatureKey.DATA_EXPORT)
  async downloadCsv(
    @Param('eventId') eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StreamableFile> {
    // Enforce usage quota and increment export counter
    await this.usageService.checkAndIncrementExport(user.organizationId);

    const { filename, buffer } =
      await this.analyticsExportService.generateCsv(eventId, user);

    return new StreamableFile(buffer, {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
      length: buffer.length,
    });
  }

  @Get('report.pdf')
  @UseGuards(PlanGuard)
  @RequiresEntitlement(FeatureKey.DATA_EXPORT)
  async downloadPdf(
    @Param('eventId') eventId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StreamableFile> {
    // Enforce usage quota and increment export counter
    await this.usageService.checkAndIncrementExport(user.organizationId);

    const { filename, buffer } =
      await this.analyticsExportService.generatePdf(eventId, user);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
      length: buffer.length,
    });
  }
}