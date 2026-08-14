import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { EventEntity, EventDocument } from '../events/event.schema';
import { randomBytes } from 'node:crypto';
import { RedisService } from '../realtime/redis.service';

const MEET_STATE_TTL_SECONDS = 10 * 60;

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly redisService: RedisService,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  private stateKey(state: string) {
    return `meet:oauth:state:${state}`;
  }

  async createAuthorizationUrl(auth0Sub: string): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_MEET_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_MEET_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new Error('Google Meet integration is not configured.');
    }

    // Standard Google OAuth2 URL
    // We only ask for email/profile to identify the user's Google ID.
    // The Add-on scope is handled separately by the Meet Add-on manifest itself.
    const scopes = encodeURIComponent(
      'openid profile email'
    );

    const state = randomBytes(32).toString('base64url');
    
    await this.redisService.client.set(
      this.stateKey(state),
      auth0Sub,
      'EX',
      MEET_STATE_TTL_SECONDS,
    );

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

    return authUrl;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const clientId = this.configService.get<string>('GOOGLE_MEET_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_MEET_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_MEET_REDIRECT_URI');

    const auth0Sub = await this.redisService.client.get(this.stateKey(state));
    if (!auth0Sub) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
    await this.redisService.client.del(this.stateKey(state));

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          redirect_uri: redirectUri!,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        this.logger.error(`Google token exchange failed: ${errorText}`);
        throw new Error('Token exchange failed');
      }

      const tokenData = (await tokenResponse.json()) as any;

      // Get user profile from Google to get their Google ID
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch Google profile');
      }

      const profileData = (await profileResponse.json()) as any;
      const googleUserId = profileData.sub; // Google's user ID

      // Save integration to the user
      const user = await this.usersService.findByAuth0Sub(auth0Sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingIntegrationIndex = user.integrations.findIndex(
        (i) => i.provider === 'meet'
      );

      const integrationData = {
        provider: 'meet',
        externalId: googleUserId,
        refreshToken: tokenData.refresh_token, // May be undefined if not returned
      };

      if (existingIntegrationIndex > -1) {
        user.integrations[existingIntegrationIndex] = integrationData;
      } else {
        user.integrations.push(integrationData);
      }

      await user.save();
      this.logger.log(`Successfully linked Google Meet for user ${auth0Sub}`);
    } catch (error) {
      this.logger.error('Error handling Google Meet callback', error);
      throw error;
    }
  }

  async getEventForMeeting(meetingId: string, googleMeetUserId?: string): Promise<EventDocument> {
    // 1. Check if meeting is already linked to an event
    const existingEvent = await this.eventModel
      .findOne({
        'integrations.provider': 'meet',
        'integrations.externalId': meetingId,
      })
      .exec();
    
    if (existingEvent) {
      return existingEvent;
    }

    throw new UnauthorizedException('No event is linked to this Google Meet yet.');
  }

  async linkMeetingToEvent(meetingId: string, eventCode: string): Promise<void> {
    const event = await this.eventsService.findByEventCode(eventCode);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const hasMeet = event.integrations?.some(
      (i) => i.provider === 'meet' && i.externalId === meetingId,
    );
    if (hasMeet) return;

    if (!event.integrations) {
      event.integrations = [];
    }

    // Replace any existing meet link and add the new one
    event.integrations = event.integrations.filter(
      (i) => i.provider !== 'meet',
    );
    event.integrations.push({ provider: 'meet', externalId: meetingId });

    await event.save();
    this.logger.log(
      `Manually linked IEP event ${event.eventCode} to Google Meet meeting ${meetingId}`,
    );
  }
}
