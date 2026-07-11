import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('api/teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates the Microsoft OAuth2 authorization URL for the logged-in host.
   * The returned URL includes a one-time state value mapped to this host.
   */
  @UseGuards(JwtAuthGuard)
  @Get('authorize')
  async authorize(
    @Query('loginHint') loginHint: string | undefined,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const url = await this.teamsService.createAuthorizationUrl(
      req.user.auth0Sub,
      loginHint,
    );
    return res.json({ url });
  }

  /**
   * Microsoft redirects here after the host authorizes the app.
   * We exchange the code for tokens and save the integration to the user profile.
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
        `Microsoft Teams OAuth failed: ${errorDescription || error}`,
      );
    }

    if (!code || !state) {
      throw new UnauthorizedException(
        'Missing code or state from Microsoft OAuth',
      );
    }

    await this.teamsService.handleCallback(code, state);

    res.redirect(`${frontendUrl}/dashboard/settings?teams=connected`);
  }

  /**
   * Called by the Teams app side panel on load.
   * Returns the IEP event linked to this Teams meeting, or auto-creates one if
   * the calling user is a registered host.
   */
  @Get('context-to-event')
  async contextToEvent(
    @Query('meetingId') meetingId: string,
    @Query('teamsUserId') teamsUserId?: string,
  ) {
    if (!meetingId) {
      throw new UnauthorizedException('Missing meetingId');
    }
    const event = await this.teamsService.getOrCreateEventForMeeting(
      meetingId,
      teamsUserId,
    );
    return { eventCode: event.eventCode };
  }

  /**
   * Called when a participant or host manually enters an event code in the Teams app.
   * Links the Teams meeting ID to the IEP event permanently.
   */
  @Get('link-meeting')
  async linkMeeting(
    @Query('meetingId') meetingId: string,
    @Query('eventCode') eventCode: string,
  ) {
    if (!meetingId || !eventCode) {
      throw new UnauthorizedException('Missing meetingId or eventCode');
    }
    await this.teamsService.linkMeetingToEvent(meetingId, eventCode);
    return { success: true };
  }

  /**
   * Health check endpoint - useful for verifying the Teams module is wired up.
   */
  @Get('status')
  status() {
    const clientId = this.configService.get<string>('TEAMS_CLIENT_ID');
    return {
      configured: Boolean(clientId),
      provider: 'microsoft-teams',
    };
  }
}
