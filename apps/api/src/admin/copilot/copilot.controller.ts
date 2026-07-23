import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import { RateLimitService } from '../../realtime/rate-limit.service';
import { CopilotService } from './copilot.service';
import { CopilotChatDto } from './dto/copilot-chat.dto';
import type { AuthenticatedUser } from '../../auth/jwt.strategy';

@Controller('admin/copilot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'support')
export class CopilotController {
  constructor(
    private readonly copilotService: CopilotService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  /**
   * POST /admin/copilot/chat
   * Main chat endpoint — accepts a message and optional conversationId / pageContext.
   * Sprint 8: Rate-limited to 20 requests per minute per admin.
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() body: CopilotChatDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    // Sprint 8: Per-admin rate limiting — 20 queries / minute
    const adminId = admin._id?.toString() ?? admin.auth0Sub;
    const rl = await this.rateLimitService.consume(`copilot:${adminId}`, 20, 60);
    if (!rl.allowed) {
      throw new HttpException(
        { message: 'Too many Copilot requests. Please wait a moment.', retryAfterMs: rl.retryAfter * 1000 },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.copilotService.chat(body, admin);
  }

  /**
   * POST /admin/copilot/conversations
   * Create a new conversation (optional — chat auto-creates if not provided).
   */
  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @Body() body: { pageContext?: { type: 'user' | 'event' | 'ticket' | 'article' | 'live-session'; id: string } },
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const id = await this.copilotService.getOrCreateConversation(admin, body.pageContext);
    return { conversationId: id };
  }

  /**
   * GET /admin/copilot/conversations
   * List recent conversations for the current admin (Sprint 6).
   */
  @Get('conversations')
  async listConversations(@CurrentUser() admin: AuthenticatedUser) {
    return this.copilotService.listConversations(admin);
  }

  /**
   * GET /admin/copilot/conversations/:id
   * Get full conversation history (Sprint 6).
   */
  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.copilotService.getConversation(id, admin);
  }
}
