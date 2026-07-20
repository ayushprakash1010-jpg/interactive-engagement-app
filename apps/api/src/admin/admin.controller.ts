import { Controller, Get, Post, Param, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
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
@Roles('admin')
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
}
