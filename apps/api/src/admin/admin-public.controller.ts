import { Controller, Post, Body, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';

/**
 * Public routes related to Admin functions.
 * Does NOT use JwtAuthGuard or RolesGuard, allowing server-side exchanges.
 */
@Controller('admin')
export class AdminPublicController {
  constructor(private readonly adminService: AdminService) {}

  @Post('impersonate/exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeHandoffCode(@Body('code') code: string) {
    if (!code) {
      throw new ForbiddenException('Code is required');
    }
    return this.adminService.exchangeHandoffCode(code);
  }
}
