import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { EventEntity, EventDocument } from '../events/event.schema';

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

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

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${encodeURIComponent(auth0Sub)}`;

    return authUrl;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const clientId = this.configService.get<string>('GOOGLE_MEET_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_MEET_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_MEET_REDIRECT_URI');

    const auth0Sub = state; // We passed auth0Sub in the state parameter

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

  async getOrCreateEventForMeeting(meetingId: string, googleMeetUserId?: string): Promise<EventDocument> {
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

    // 2. If no event exists but we have a user ID, auto-create one for this host
    if (googleMeetUserId) {
      const user = await this.usersService.findByGoogleMeetId(googleMeetUserId);
      if (user) {
        this.logger.log(`Auto-creating event for Google Meet user ${googleMeetUserId}`);
        const event = await this.eventsService.create(user._id.toString(), {
          name: `Google Meet Session ${meetingId}`,
          description: 'Auto-created from Google Meet Add-on',
          settings: {
            allowAnonymousQA: true,
            requireModeration: false,
            participantNames: true,
          },
        });
        
        event.integrations = [{ provider: 'meet', externalId: meetingId }];
        await event.save();

        return event;
      }
    }

    throw new NotFoundException('No event found for this meeting and user is not a recognized host');
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
