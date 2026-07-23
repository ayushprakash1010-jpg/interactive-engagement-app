import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { FeatureFlagsService, CreateFeatureFlagDto, UpdateFeatureFlagDto } from './feature-flags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { PreventImpersonation } from '../auth/prevent-impersonation.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('admin/feature-flags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'support')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AdminFeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  async listAll() {
    const flags = await this.featureFlagsService.listAll();
    // Return sanitized models for the UI
    return flags.map(flag => ({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      isGlobalEnabled: flag.isGlobalEnabled,
      organizationOverrides: Object.fromEntries(flag.organizationOverrides?.entries() || []),
    }));
  }

  @Post()
  @Roles('admin')
  @PreventImpersonation()
  async create(@Body() dto: CreateFeatureFlagDto, @CurrentUser() user: AuthenticatedUser) {
    const flag = await this.featureFlagsService.create(dto, { id: user.id, email: user.email });
    return {
      key: flag.key,
      name: flag.name,
      description: flag.description,
      isGlobalEnabled: flag.isGlobalEnabled,
      organizationOverrides: Object.fromEntries(flag.organizationOverrides?.entries() || []),
    };
  }

  @Patch(':key')
  @Roles('admin')
  @PreventImpersonation()
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const flag = await this.featureFlagsService.update(key, dto, { id: user.id, email: user.email });
    return {
      key: flag.key,
      name: flag.name,
      description: flag.description,
      isGlobalEnabled: flag.isGlobalEnabled,
      organizationOverrides: Object.fromEntries(flag.organizationOverrides?.entries() || []),
    };
  }

  @Patch(':key/overrides/:orgId')
  @Roles('admin')
  @PreventImpersonation()
  async setOverride(
    @Param('key') key: string,
    @Param('orgId') orgId: string,
    @Body('isEnabled') isEnabled: boolean,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const flag = await this.featureFlagsService.setOrganizationOverride(key, orgId, isEnabled, { id: user.id, email: user.email });
    return {
      key: flag.key,
      organizationOverrides: Object.fromEntries(flag.organizationOverrides?.entries() || []),
    };
  }

  @Delete(':key/overrides/:orgId')
  @Roles('admin')
  @PreventImpersonation()
  async removeOverride(
    @Param('key') key: string,
    @Param('orgId') orgId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const flag = await this.featureFlagsService.removeOrganizationOverride(key, orgId, { id: user.id, email: user.email });
    return {
      key: flag.key,
      organizationOverrides: Object.fromEntries(flag.organizationOverrides?.entries() || []),
    };
  }

  @Delete(':key')
  @Roles('admin')
  @PreventImpersonation()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('key') key: string, @CurrentUser() user: AuthenticatedUser) {
    await this.featureFlagsService.delete(key, { id: user.id, email: user.email });
  }
}
