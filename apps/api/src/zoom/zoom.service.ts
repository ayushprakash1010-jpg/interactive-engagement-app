import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument, EventEntity } from '../events/event.schema';
import { randomBytes, createHash, createDecipheriv } from 'node:crypto';
import { RedisService } from '../realtime/redis.service';

const ZOOM_STATE_TTL_SECONDS = 10 * 60;

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly redisService: RedisService,
    @InjectModel(EventEntity.name) private readonly eventModel: Model<EventDocument>
  ) { }

  private stateKey(state: string) {
    return `zoom:oauth:state:${state}`;
  }

  async createAuthorizationUrl(auth0Sub: string): Promise<string> {
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const redirectUri = this.configService.get<string>('ZOOM_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new Error('Zoom configuration is missing');
    }

    const state = randomBytes(32).toString('base64url');
    
    await this.redisService.client.set(
      this.stateKey(state),
      auth0Sub,
      'EX',
      ZOOM_STATE_TTL_SECONDS,
    );

    return `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
  }

  async handleCallback(code: string, state: string): Promise<string> {
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

    const generateDeeplink = async () => {
      let dl = 'zoommtg://zoom.us/client/latest/launch?action=app';
      try {
        const dlRes = await fetch('https://api.zoom.us/v2/zoomapp/deeplink', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'go' })
        });
        if (dlRes.ok) {
          const dlData = await dlRes.json() as { deeplink: string };
          if (dlData.deeplink) dl = dlData.deeplink;
        }
      } catch (e) {
        this.logger.warn('Failed to generate deeplink', e);
      }
      return dl;
    };

    // 3. Save to user profile (if state was provided)
    if (!state) {
      this.logger.log(`Zoom connected for Zoom ID ${zoomUserId} (Web Marketplace Install - no state)`);
      return await generateDeeplink();
    }

    const auth0Sub = await this.redisService.client.get(this.stateKey(state));
    if (!auth0Sub) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
    await this.redisService.client.del(this.stateKey(state));

    const user = await this.usersService.findByAuth0Sub(auth0Sub);
    if (!user) {
      this.logger.warn(`User ${auth0Sub} not found during Zoom OAuth callback, but Zoom was successfully authorized.`);
      return await generateDeeplink();
    }

    // Find and update the integration, or add it if it doesn't exist.
    // MongoDB array update using aggregation pipeline or simple pull/push.
    // We'll just pull any existing zoom integration and push the new one.

    // Parse the token to get the auid (App-specific User ID), which is what the Zoom Client SDK returns
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
          externalId: auid, // Save the auid so it matches what the frontend gets!
          zoomUserId: zoomUserId, // Save the numeric ID so contextToEvent can match it
          refreshToken: refreshToken,
        },
      },
    });

    this.logger.log(`Zoom connected for user ${auth0Sub} with Zoom ID ${zoomUserId}`);

    // 4. Generate deeplink
    return await generateDeeplink();
  }

  decryptContext(context: string, clientSecret: string) {
    try {
      const buffer = Buffer.from(context, 'base64url');
      const iv = buffer.subarray(0, 16);
      const aadLength = buffer.readUInt16LE(16);
      const aad = buffer.subarray(18, 18 + aadLength);
      const payload = buffer.subarray(18 + aadLength, buffer.length - 16);
      const authTag = buffer.subarray(buffer.length - 16);
      
      const hash = createHash('sha256').update(clientSecret).digest();
      const decipher = createDecipheriv('aes-256-gcm', hash, iv);
      decipher.setAAD(aad);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(payload, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (e) {
      this.logger.warn('Failed to decrypt Zoom App Context', e);
      return null;
    }
  }

  async getEventForMeeting(
    meetingId: string,
    zoomUserId?: string,
  ): Promise<EventDocument> {
    const existing = await this.eventModel.findOne({
      'integrations.provider': 'zoom',
      'integrations.externalId': meetingId,
    });
    if (existing) return existing;

    // Auto-create only if zoomUserId is securely provided
    if (!zoomUserId) {
      throw new UnauthorizedException('Missing verified Zoom Identity');
    }
    
    let hostId = zoomUserId;
    const hostUser = await this.usersService.findByZoomId(zoomUserId);
    if (!hostUser) {
      throw new UnauthorizedException('Event for this Zoom meeting has not been created by the host yet.');
    }
    hostId = hostUser._id.toString();

    // Auto-create the event
    const newEvent = await this.eventsService.create(hostId, {
      name: `Zoom Meeting ${meetingId}`,
      description: 'Auto-created from Zoom App',
      settings: {
        allowAnonymousQA: true,
        requireModeration: false,
        participantNames: true
      },
    });

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
