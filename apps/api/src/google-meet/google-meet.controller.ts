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
import { GoogleMeetService } from './google-meet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('api/google-meet')
export class GoogleMeetController {
  constructor(
    private readonly googleMeetService: GoogleMeetService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates the Google OAuth2 authorization URL for the logged-in host.
   */
  @UseGuards(JwtAuthGuard)
  @Get('authorize')
  async authorize(
    @Res() res: Response,
    @Req() req: Request & { user: { auth0Sub: string } },
  ) {
    const url = await this.googleMeetService.createAuthorizationUrl(req.user.auth0Sub);
    return res.json({ url });
  }

  /**
   * Google redirects here after the host authorizes the app.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (error) {
      throw new UnauthorizedException(`Google Meet OAuth failed: ${error}`);
    }

    if (!code || !state) {
      throw new UnauthorizedException('Missing code or state from Google OAuth');
    }

    await this.googleMeetService.handleCallback(code, state);

    res.redirect(`${frontendUrl}/dashboard/settings?meet=connected`);
  }

  /**
   * Called by the Google Meet Add-on side panel on load.
   */
  @Get('context-to-event')
  async contextToEvent(
    @Query('meetingId') meetingId: string,
    @Query('meetUserId') meetUserId?: string,
  ) {
    if (!meetingId) {
      throw new UnauthorizedException('Missing meetingId');
    }
    const event = await this.googleMeetService.getOrCreateEventForMeeting(
      meetingId,
      meetUserId,
    );
    return { eventCode: event.eventCode };
  }

  /**
   * Links a Google Meet meeting ID to the IEP event permanently.
   */
  @Get('link-meeting')
  async linkMeeting(
    @Query('meetingId') meetingId: string,
    @Query('eventCode') eventCode: string,
  ) {
    if (!meetingId || !eventCode) {
      throw new UnauthorizedException('Missing meetingId or eventCode');
    }
    await this.googleMeetService.linkMeetingToEvent(meetingId, eventCode);
    return { success: true };
  }

  /**
   * Health check endpoint.
   */
  @Get('status')
  status() {
    const clientId = this.configService.get<string>('GOOGLE_MEET_CLIENT_ID');
    return {
      configured: Boolean(clientId),
      provider: 'google-meet',
    };
  }
}
