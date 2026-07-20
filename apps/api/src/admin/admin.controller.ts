import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { PreventImpersonation, AllowImpersonationMutation } from '../auth/prevent-impersonation.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AdminService } from './admin.service';
import type { GetUsersQuery, GetEventsQuery } from './admin.service';

/**
 * Admin-only oversight surface (Sprint 7 RBAC). Every route requires a valid
 * Auth0 token (JwtAuthGuard) AND role='admin' (RolesGuard + @Roles).
 *
 * The controller is intentionally thin — all query logic lives in AdminService.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'support')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Identity and RBAC check for the Admin Console.
   * Returns the calling admin's identity fields from req.user, which is
   * already populated by JwtStrategy.validate() — no extra DB call needed.
   * The Admin Console calls this immediately after login to verify the user
   * has the 'admin' role before rendering the Workspace Launcher.
   */
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Phase 2 — Global user search with server-side pagination.
   *
   * GET /admin/users
   *   ?search=ayush        — case-insensitive regex on name/email, exact on ObjectId / auth0Sub
   *   &role=host           — whitelist: 'host' | 'admin'
   *   &page=1              — 1-indexed, default 1
   *   &limit=20            — default 20, max 100
   *   &sort=createdAt      — whitelist: createdAt | name | email | role
   *   &order=desc          — whitelist: asc | desc
   *
   * Never returns raw Mongoose documents or sensitive fields.
   */
  @Get('users')
  getUsers(@Query() query: GetUsersQuery) {
    return this.adminService.getUsers(query);
  }

  /**
   * Phase 2 — User detail page.
   *
   * GET /admin/users/:id
   * Returns profile, event activity summary (max 5 recent events), and a safe
   * integration status map (boolean per provider). OAuth tokens and secrets
   * are never returned.
   */
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  /**
   * Phase 3 — Global event search with server-side pagination.
   */
  @Get('events')
  getEvents(@Query() query: GetEventsQuery) {
    return this.adminService.getEvents(query);
  }

  /**
   * Phase 3 — Event detail page.
   */
  @Get('events/:id')
  getEventById(@Param('id') id: string) {
    return this.adminService.getEventById(id);
  }

  /**
   * Phase 4 — Realtime diagnostics
   */
  @Get('events/:id/diagnostics')
  getEventDiagnostics(@Param('id') id: string) {
    return this.adminService.getEventDiagnostics(id);
  }

  /**
   * Phase 4 & 6 — Force end event
   */
  @Post('events/:id/end')
  @Roles('admin')
  @PreventImpersonation()
  @HttpCode(HttpStatus.NO_CONTENT)
  forceEndEvent(
    @Param('id') id: string,
    @CurrentUser() adminUser: AuthenticatedUser,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.forceEndEvent(id, adminUser, reason);
  }

  /**
   * Phase 5 — Integration Diagnostics
   */
  @Get('integrations')
  getIntegrationDiagnostics(@Query() query: GetUsersQuery) {
    return this.adminService.getIntegrationDiagnostics(query);
  }

  /**
   * Phase 6 — Audit Logs
   */
  @Get('audit-logs')
  getAuditLogs(@Query() query: any) {
    return this.adminService.getAuditLogs(query);
  }

  // ── Organizations ──────────────────────────────────────────────────────────

  @Get('organizations')
  getOrganizations(@Query() query: any) {
    return this.adminService.getOrganizations(query);
  }

  @Get('organizations/:id')
  getOrganizationById(@Param('id') id: string) {
    return this.adminService.getOrganizationById(id);
  }

  @Post('organizations')
  @Roles('admin')
  @PreventImpersonation()
  createOrganization(@CurrentUser() admin: AuthenticatedUser, @Body() body: { name: string; plan?: string }) {
    return this.adminService.createOrganization(admin, body);
  }

  @Patch('organizations/:id/users/:userId')
  @Roles('admin')
  @PreventImpersonation()
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignUserToOrganization(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    await this.adminService.assignUserToOrganization(admin, id, userId);
  }

  @Delete('organizations/:id/users/:userId')
  @Roles('admin')
  @PreventImpersonation()
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignUserFromOrganization(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    await this.adminService.unassignUserFromOrganization(admin, id, userId);
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // ── Impersonation ──────────────────────────────────────────────────────────

  @Post('impersonate/stop')
  @Roles('host', 'admin', 'support')
  @AllowImpersonationMutation()
  @HttpCode(HttpStatus.OK)
  async stopImpersonation(@CurrentUser() user: AuthenticatedUser) {
    if (!user.isImpersonating) {
      throw new ForbiddenException('Not an impersonation session');
    }
    return this.adminService.logImpersonationStopped(user);
  }

  @Post('impersonate/:userId')
  @HttpCode(HttpStatus.OK)
  async createImpersonationToken(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body('reason') reason: string
  ) {
    if (admin.isImpersonating) {
      throw new ForbiddenException('Cannot impersonate while already impersonating.');
    }
    return this.adminService.createImpersonationToken(admin, userId, reason);
  }

  // ── User Management ────────────────────────────────────────────────────────

  @Patch('users/:id/suspend')
  @Roles('admin') // explicitly admin only, not support
  @PreventImpersonation()
  @HttpCode(HttpStatus.OK)
  async suspendUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') targetUserId: string,
    @Body('reason') reason: string
  ) {
    return this.adminService.suspendUser(admin.id, admin.email, targetUserId, reason);
  }

  @Patch('users/:id/reactivate')
  @Roles('admin')
  @PreventImpersonation()
  @HttpCode(HttpStatus.OK)
  async reactivateUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') targetUserId: string,
    @Body('reason') reason: string
  ) {
    return this.adminService.reactivateUser(admin.id, admin.email, targetUserId, reason);
  }

  // ── AI Operations ────────────────────────────────────────────────────────
  @Get('ai-operations')
  @Roles('admin', 'support')
  async getAiOperationsTelemetry() {
    return this.adminService.getAiOperationsTelemetry();
  }
}

