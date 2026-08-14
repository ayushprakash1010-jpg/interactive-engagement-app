import { Controller, Get, Post, Query, Req, Res, UseGuards, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
// Force TS server refresh
import { ZoomService } from './zoom.service';
import { EventsService } from '../events/events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/zoom')
export class ZoomController {
  constructor(
    private readonly zoomService: ZoomService,
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('authorize')
  async authorize(@Req() req: Request & { user: { auth0Sub: string } }, @Res() res: Response) {
    const url = await this.zoomService.createAuthorizationUrl(req.user.auth0Sub);
    return res.json({ url });
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code) {
      throw new UnauthorizedException('Missing code');
    }

    // Exchange code for token and save it to the user profile (if state is present)
    const deeplink = await this.zoomService.handleCallback(code, state);

    // Zoom Apps requirement: Redirect to a success page that deep-links back to the Zoom Client
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/zoom/success?deeplink=${encodeURIComponent(deeplink)}`);
  }

  @Get('context-to-event')
  async contextToEvent(
    @Query('meetingId') meetingId: string,
    @Req() req: Request
  ) {
    if (!meetingId) {
      throw new UnauthorizedException('Missing meetingId');
    }
    
    let verifiedZoomUserId: string | undefined;
    const zoomContext = req.headers['x-zoom-app-context'] as string;
    
    if (zoomContext) {
      const secret = this.configService.get<string>('ZOOM_CLIENT_SECRET');
      if (secret) {
        const decrypted = this.zoomService.decryptContext(zoomContext, secret);
        if (decrypted && decrypted.uid) {
          verifiedZoomUserId = decrypted.uid;
        }
      }
    }

    const event = await this.zoomService.getEventForMeeting(meetingId, verifiedZoomUserId);
    return { eventCode: event.eventCode };
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-meeting')
  async linkMeeting(
    @Req() req: Request & { user: { id: string } },
    @Query('meetingId') meetingId: string,
    @Query('eventCode') eventCode: string
  ) {
    if (!meetingId || !eventCode) throw new UnauthorizedException('Missing parameters');
    
    // Verify ownership
    const event = await this.eventsService.findByEventCode(eventCode);
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId.toString() !== req.user.id) throw new UnauthorizedException('Only the host can link this event');

    await this.zoomService.linkMeetingToEvent(meetingId, eventCode);
    return { success: true };
  }
}
