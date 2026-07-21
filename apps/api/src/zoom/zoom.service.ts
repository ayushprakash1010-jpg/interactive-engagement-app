import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument, EventEntity } from '../events/event.schema';

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    @InjectModel(EventEntity.name) private readonly eventModel: Model<EventDocument>
  ) { }

  async handleCallback(code: string, auth0Sub: string): Promise<{ deeplink?: string }> {
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('ZOOM_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Zoom configuration is missing');
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 1. Exchange code for access_token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      this.logger.error(`Zoom token error: ${await tokenResponse.text()}`);
      throw new UnauthorizedException('Failed to exchange Zoom authorization code');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; refresh_token: string };
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // 2. Fetch Zoom User Profile to get zoomUserId
    const profileResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!profileResponse.ok) {
      this.logger.error(`Zoom profile error: ${await profileResponse.text()}`);
      throw new UnauthorizedException('Failed to fetch Zoom profile');
    }

    const profileData = (await profileResponse.json()) as { id: string };
    const zoomUserId = profileData.id;

    // 3. Generate Official App Deeplink to redirect back to Zoom Client
    let deeplink: string | undefined;
    try {
      const deepLinkResponse = await fetch('https://api.zoom.us/v2/zoomapp/deeplink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'start' })
      });
      if (deepLinkResponse.ok) {
        const data = (await deepLinkResponse.json()) as { deeplink: string };
        deeplink = data.deeplink;
      } else {
        this.logger.warn(`Failed to generate deeplink: ${await deepLinkResponse.text()}`);
      }
    } catch (e) {
      this.logger.error('Failed to generate Zoom App deeplink', e);
    }

    // 4. Save to user profile (if auth0Sub was provided)
    if (!auth0Sub) {
      this.logger.log(`Zoom connected for Zoom ID ${zoomUserId} (Web Marketplace Install - no auth0Sub)`);
      return { deeplink };
    }

    const user = await this.usersService.findByAuth0Sub(auth0Sub);
    if (!user) {
      this.logger.warn(`User ${auth0Sub} not found during Zoom OAuth callback, but Zoom was successfully authorized.`);
      return { deeplink };
    }

    // Parse the token to get the auid
    let auid = zoomUserId;
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.auid) auid = payload.auid;
      }
    } catch (e) {
      this.logger.warn('Failed to parse auid from token, falling back to global id');
    }

    await user.updateOne({
      $pull: { integrations: { provider: 'zoom' } },
    });

    await user.updateOne({
      $push: {
        integrations: {
          provider: 'zoom',
          externalId: auid,
          zoomUserId: zoomUserId,
          refreshToken: refreshToken,
        },
      },
    });

    this.logger.log(`Zoom connected for user ${auth0Sub} with Zoom ID ${zoomUserId}`);
    return { deeplink };
  }

  async getOrCreateEventForMeeting(meetingId: string, zoomUserId?: string): Promise<EventDocument> {
    // Check if an event already exists for this meeting
    const existingEvent = await this.eventModel.findOne({
      'integrations.provider': 'zoom',
      'integrations.externalId': meetingId
    }).exec();
    if (existingEvent) {
      return existingEvent;
    }

    if (!zoomUserId) {
      throw new UnauthorizedException('Event for this Zoom meeting has not been created by the host yet.');
    }

    // Try to find if this zoomUserId matches a registered host in our system
    const hostUser = await this.usersService.findByZoomId(zoomUserId);
    if (!hostUser) {
      throw new UnauthorizedException('Event for this Zoom meeting has not been created by the host yet.');
    }

    // Auto-create the event!
    const newEvent = await this.eventsService.create(hostUser._id.toString(), {
      name: `Zoom Meeting ${meetingId}`,
      description: 'Auto-created from Zoom App',
      settings: {
        allowAnonymousQA: true,
        requireModeration: false,
        participantNames: true
      },
    });

    // Add the Zoom integration
    newEvent.integrations = [{
      provider: 'zoom',
      externalId: meetingId,
    }];
    await newEvent.save();

    this.logger.log(`Auto-created IEP event ${newEvent.eventCode} for Zoom meeting ${meetingId} (Host: ${hostUser.email})`);
    return newEvent;
  }

  async linkMeetingToEvent(meetingId: string, eventCode: string): Promise<void> {
    const event = await this.eventsService.findByEventCode(eventCode);
    if (!event) {
      throw new UnauthorizedException('Event not found');
    }

    // Check if it's already linked
    const hasZoom = event.integrations?.some(i => i.provider === 'zoom' && i.externalId === meetingId);
    if (hasZoom) return;

    if (!event.integrations) {
      event.integrations = [];
    }

    // Remove any existing zoom link for this event just in case, and add the new one
    event.integrations = event.integrations.filter(i => i.provider !== 'zoom');
    event.integrations.push({
      provider: 'zoom',
      externalId: meetingId,
    });

    await event.save();
    this.logger.log(`Manually linked IEP event ${event.eventCode} to Zoom meeting ${meetingId}`);
  }
}
