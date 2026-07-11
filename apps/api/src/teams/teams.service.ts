import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { EventEntity, EventDocument } from '../events/event.schema';
import { RedisService } from '../realtime/redis.service';

const TEAMS_OAUTH_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'User.Read',
];

const TEAMS_STATE_TTL_SECONDS = 10 * 60;

type TeamsOAuthState = {
  auth0Sub: string;
  codeVerifier: string;
  createdAt: number;
};

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async createAuthorizationUrl(
    auth0Sub: string,
    loginHint?: string,
  ): Promise<string> {
    const clientId = this.configService.get<string>('TEAMS_CLIENT_ID');
    const redirectUri = this.configService.get<string>('TEAMS_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new Error('Microsoft Teams configuration is missing');
    }

    const state = randomBytes(32).toString('base64url');
    const codeVerifier = randomBytes(64).toString('base64url');
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const statePayload: TeamsOAuthState = {
      auth0Sub,
      codeVerifier,
      createdAt: Date.now(),
    };

    await this.redisService.client.set(
      this.stateKey(state),
      JSON.stringify(statePayload),
      'EX',
      TEAMS_STATE_TTL_SECONDS,
    );

    const authorizeUrl = new URL(
      `${this.microsoftAuthorityBase()}/oauth2/v2.0/authorize`,
    );
    authorizeUrl.search = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: TEAMS_OAUTH_SCOPES.join(' '),
      state,
      prompt: 'select_account',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      ...(loginHint ? { login_hint: loginHint } : {}),
    }).toString();

    this.logger.debug(
      `Created Teams OAuth authorization URL using tenant "${this.microsoftTenant()}"`,
    );

    return authorizeUrl.toString();
  }

  /**
   * Exchanges a Microsoft OAuth authorization code for tokens, fetches the
   * user's AAD profile, and stores the integration on the IEP user record.
   */
  async handleCallback(code: string, state: string): Promise<void> {
    const clientId = this.configService.get<string>('TEAMS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('TEAMS_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('TEAMS_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Microsoft Teams configuration is missing');
    }

    const statePayload = await this.consumeState(state);

    // 1. Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      code_verifier: statePayload.codeVerifier,
      scope: TEAMS_OAUTH_SCOPES.join(' '),
    });

    const tokenResponse = await fetch(
      `${this.microsoftAuthorityBase()}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString(),
      },
    );

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      this.logger.error(`Teams token exchange FULL error (${tokenResponse.status}): ${errText}`);
      throw new UnauthorizedException(
        `Failed to exchange Teams authorization code: ${errText}`,
      );
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      id_token?: string;
    };

    const { access_token: accessToken, refresh_token: refreshToken } =
      tokenData;

    // 2. Fetch Microsoft Graph profile to get the AAD Object ID
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      this.logger.error(
        `Teams Graph profile error: ${await profileResponse.text()}`,
      );
      throw new UnauthorizedException('Failed to fetch Microsoft profile');
    }

    const profileData = (await profileResponse.json()) as {
      id: string; // AAD Object ID
      userPrincipalName?: string;
      mail?: string;
      displayName?: string;
    };

    const aadObjectId = profileData.id;
    const upn = profileData.userPrincipalName ?? profileData.mail ?? '';

    // 3. Save integration to user profile
    const user = await this.usersService.findByAuth0Sub(statePayload.auth0Sub);
    if (!user) {
      throw new UnauthorizedException('IEP user not found');
    }

    // Pull any existing Teams integration and push the fresh one
    await user.updateOne({ $pull: { integrations: { provider: 'teams' } } });
    await user.updateOne({
      $push: {
        integrations: {
          provider: 'teams',
          externalId: aadObjectId, // AAD Object ID returned by the Teams JS SDK
          zoomUserId: upn, // Existing integration field used for provider-specific secondary IDs
          refreshToken: refreshToken,
        },
      },
    });

    this.logger.log(
      `Teams connected for user ${statePayload.auth0Sub} (AAD: ${aadObjectId}, UPN: ${upn})`,
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
    const hostUser = await this.usersService.findByTeamsId(teamsUserId);
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
  async linkMeetingToEvent(
    meetingId: string,
    eventCode: string,
  ): Promise<void> {
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
    event.integrations = event.integrations.filter(
      (i) => i.provider !== 'teams',
    );
    event.integrations.push({ provider: 'teams', externalId: meetingId });

    await event.save();
    this.logger.log(
      `Manually linked IEP event ${event.eventCode} to Teams meeting ${meetingId}`,
    );
  }

  private microsoftTenant(): string {
    return this.configService.get<string>('TEAMS_TENANT_ID') || 'common';
  }

  private microsoftAuthorityBase(): string {
    return `https://login.microsoftonline.com/${encodeURIComponent(
      this.microsoftTenant(),
    )}`;
  }

  private stateKey(state: string): string {
    return `teams:oauth:state:${state}`;
  }

  private async consumeState(state: string): Promise<TeamsOAuthState> {
    const key = this.stateKey(state);
    const rawState = await this.redisService.client.get(key);
    if (rawState) {
      await this.redisService.client.del(key);
    }

    if (!rawState) {
      this.logger.error(`Teams OAuth state not found in Redis for key: ${key}`);
      throw new UnauthorizedException(
        'Invalid or expired Microsoft Teams OAuth state',
      );
    }

    try {
      const parsed = JSON.parse(rawState) as TeamsOAuthState;
      if (!parsed.auth0Sub || !parsed.codeVerifier) {
        throw new Error('Missing state fields');
      }
      return parsed;
    } catch {
      throw new UnauthorizedException('Invalid Microsoft Teams OAuth state');
    }
  }
}
