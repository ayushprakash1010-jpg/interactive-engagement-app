import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PowerPointService } from './powerpoint.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('api/powerpoint')
export class PowerPointController {
  constructor(
    private readonly powerPointService: PowerPointService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates the Microsoft OAuth2 URL for connecting a PowerPoint account.
   * Called from the Settings page "Connect PowerPoint" button.
   */
  @UseGuards(JwtAuthGuard)
  @Get('authorize')
  authorize(
    @Req() req: Request & { user: { auth0Sub: string } },
    @Res() res: Response,
  ) {
    const url = this.powerPointService.createAuthorizationUrl(req.user.auth0Sub);
    return res.json({ url });
  }

  /**
   * Microsoft redirects here after authorization.
   * Exchanges the code for tokens and saves the integration.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (error) {
      throw new UnauthorizedException(
        `PowerPoint OAuth failed: ${errorDescription || error}`,
      );
    }

    if (!code || !state) {
      throw new UnauthorizedException('Missing code or state from Microsoft OAuth');
    }

    await this.powerPointService.handleCallback(code, state);

    res.redirect(`${frontendUrl}/dashboard/settings?powerpoint=connected`);
  }

  /**
   * Called by the PowerPoint task pane on load.
   * presentationId is the document.id from Office.js API.
   * Returns the IEP event code linked to this presentation.
   */
  @Get('context-to-event')
  async contextToEvent(
    @Query('presentationId') presentationId: string,
    @Query('microsoftUserId') microsoftUserId?: string,
  ) {
    if (!presentationId) {
      throw new UnauthorizedException('Missing presentationId');
    }
    const event = await this.powerPointService.getOrCreateEventForPresentation(
      presentationId,
      microsoftUserId,
    );
    return { eventCode: event.eventCode };
  }

  /**
   * Called when the user manually enters an event code inside the task pane.
   * Links the presentation to the given Pulse event.
   */
  @Get('link-presentation')
  async linkPresentation(
    @Query('presentationId') presentationId: string,
    @Query('eventCode') eventCode: string,
  ) {
    if (!presentationId || !eventCode) {
      throw new UnauthorizedException('Missing presentationId or eventCode');
    }
    await this.powerPointService.linkPresentationToEvent(presentationId, eventCode);
    return { success: true };
  }

  /**
   * Health check — verifies configuration and returns the provider status.
   */
  @Get('status')
  status() {
    const clientId =
      this.configService.get<string>('POWERPOINT_CLIENT_ID') ||
      this.configService.get<string>('TEAMS_CLIENT_ID');
    return {
      configured: Boolean(clientId),
      provider: 'powerpoint',
      note: 'Reuses Microsoft Azure AD App Registration. Ensure POWERPOINT_REDIRECT_URI is set.',
    };
  }
}
