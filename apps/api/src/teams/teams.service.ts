import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { EventEntity, EventDocument } from '../events/event.schema';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Exchanges a Microsoft OAuth authorization code for tokens, fetches the
   * user's AAD profile, and stores the integration on the IEP user record.
   */
  async handleCallback(code: string, auth0Sub: string): Promise<void> {
    const clientId = this.configService.get<string>('TEAMS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('TEAMS_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('TEAMS_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Microsoft Teams configuration is missing');
    }

    // 1. Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      scope: 'openid profile email User.Read',
    });

    const tokenResponse = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString(),
      },
    );

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      this.logger.error(`Teams token exchange error: ${errText}`);
      throw new UnauthorizedException('Failed to exchange Teams authorization code');
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      id_token?: string;
    };

    const { access_token: accessToken, refresh_token: refreshToken } = tokenData;

    // 2. Fetch Microsoft Graph profile to get the AAD Object ID
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      this.logger.error(`Teams Graph profile error: ${await profileResponse.text()}`);
      throw new UnauthorizedException('Failed to fetch Microsoft profile');
    }

    const profileData = (await profileResponse.json()) as {
      id: string; // AAD Object ID
      userPrincipalName?: string;
      displayName?: string;
    };

    const aadObjectId = profileData.id;
    const upn = profileData.userPrincipalName ?? '';

    // 3. Save integration to user profile
    const user = await this.usersService.findByAuth0Sub(auth0Sub);
    if (!user) {
      throw new UnauthorizedException('IEP user not found');
    }

    // Pull any existing Teams integration and push the fresh one
    await user.updateOne({ $pull: { integrations: { provider: 'teams' } } });
    await user.updateOne({
      $push: {
        integrations: {
          provider: 'teams',
          externalId: aadObjectId, // AAD Object ID — this is what the Teams JS SDK returns
          zoomUserId: upn, // Reuse this field for Teams UPN for findBy lookups
          refreshToken: refreshToken,
        },
      },
    });

    this.logger.log(
      `Teams connected for user ${auth0Sub} (AAD: ${aadObjectId}, UPN: ${upn})`,
    );
  }

  /**
   * Finds an existing IEP event linked to this Teams meeting, or auto-creates
   * one if the caller is a recognized host. Mirrors ZoomService.getOrCreateEventForMeeting.
   */
  async getOrCreateEventForMeeting(
    meetingId: string,
    teamsUserId?: string,
  ): Promise<EventDocument> {
    // First check if this meeting is already linked to an event
    const existingEvent = await this.eventModel
      .findOne({
        'integrations.provider': 'teams',
        'integrations.externalId': meetingId,
      })
      .exec();

    if (existingEvent) {
      return existingEvent;
    }

    if (!teamsUserId) {
      throw new UnauthorizedException(
        'No event linked to this Teams meeting yet. Enter an event code.',
      );
    }

    // Try to find a host registered with this Teams user ID
    const hostUser = await this.usersService.findByZoomId(teamsUserId); // reuses the $or query
    if (!hostUser) {
      throw new UnauthorizedException(
        'No event linked to this Teams meeting yet. Enter an event code.',
      );
    }

    // Auto-create the event
    const newEvent = await this.eventsService.create(hostUser._id.toString(), {
      name: `Teams Meeting ${meetingId}`,
      description: 'Auto-created from Microsoft Teams App',
      settings: {
        allowAnonymousQA: true,
        requireModeration: false,
        participantNames: true,
      },
    });

    newEvent.integrations = [{ provider: 'teams', externalId: meetingId }];
    await newEvent.save();

    this.logger.log(
      `Auto-created IEP event ${newEvent.eventCode} for Teams meeting ${meetingId} (Host: ${hostUser.email})`,
    );
    return newEvent;
  }

  /**
   * Manually links a Teams meeting ID to an existing IEP event by its code.
   */
  async linkMeetingToEvent(meetingId: string, eventCode: string): Promise<void> {
    const event = await this.eventsService.findByEventCode(eventCode);
    if (!event) {
      throw new UnauthorizedException('Event not found');
    }

    const hasTeams = event.integrations?.some(
      (i) => i.provider === 'teams' && i.externalId === meetingId,
    );
    if (hasTeams) return;

    if (!event.integrations) {
      event.integrations = [];
    }

    // Replace any existing teams link and add the new one
    event.integrations = event.integrations.filter((i) => i.provider !== 'teams');
    event.integrations.push({ provider: 'teams', externalId: meetingId });

    await event.save();
    this.logger.log(
      `Manually linked IEP event ${event.eventCode} to Teams meeting ${meetingId}`,
    );
  }
}
