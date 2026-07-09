import { Controller, Get, Query, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
// Force TS server refresh
import { ZoomService } from './zoom.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('api/zoom')
export class ZoomController {
  constructor(
    private readonly zoomService: ZoomService,
    private readonly configService: ConfigService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('authorize')
  authorize(@Req() req: any, @Res() res: Response) {
    // Generate Zoom OAuth URL
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const redirectUri = this.configService.get<string>('ZOOM_REDIRECT_URI');
    if (!clientId || !redirectUri) {
      throw new Error('Zoom configuration is missing');
    }

    const state = req.user.auth0Sub; // Pass the user's ID in the state to map it later
    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    return res.json({ url: zoomAuthUrl });
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code || !state) {
      throw new UnauthorizedException('Missing code or state');
    }

    // Exchange code for token and save it to the user profile
    await this.zoomService.handleCallback(code, state);

    // Redirect to frontend dashboard settings
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard/settings?zoom=connected`);
  }

  @Get('context-to-event')
  async contextToEvent(
    @Query('meetingId') meetingId: string,
    @Query('zoomUserId') zoomUserId?: string
  ) {
    if (!meetingId) {
      throw new UnauthorizedException('Missing meetingId');
    }
    const event = await this.zoomService.getOrCreateEventForMeeting(meetingId, zoomUserId);
    return { eventCode: event.eventCode };
  }

  @Get('link-meeting')
  async linkMeeting(
    @Query('meetingId') meetingId: string,
    @Query('eventCode') eventCode: string
  ) {
    if (!meetingId || !eventCode) {
      throw new UnauthorizedException('Missing meetingId or eventCode');
    }
    await this.zoomService.linkMeetingToEvent(meetingId, eventCode);
    return { success: true };
  }
}
