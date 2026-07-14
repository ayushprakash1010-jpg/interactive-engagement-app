import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { EventEntity, EventDocument } from '../events/event.schema';

/**
 * PowerPoint Add-in integration service.
 *
 * Unlike Zoom/Teams/Meet which are video conferencing tools that need real-time
 * context (meetingId from SDK), PowerPoint is a presentation tool. The host
 * installs the Office Add-in, signs in via OAuth (Microsoft identity), and
 * the add-in task pane then lets them link a presentation session to a Pulse event.
 *
 * Since we already have Microsoft OAuth wired up (Teams integration reuses Azure AD),
 * the PowerPoint add-in reuses the SAME Azure AD App Registration as Teams —
 * users who connected Teams are already authenticated.
 *
 * Presentation "session" IDs are generated client-side by the Office JS API
 * (document.id) and are used as the external identifier to link to an IEP event.
 */
@Injectable()
export class PowerPointService {
  private readonly logger = new Logger(PowerPointService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Generates the Microsoft OAuth2 URL for the PowerPoint add-in task pane.
   * We reuse the Teams Azure AD App credentials — same Microsoft identity,
   * so no new app registration is needed if Teams is already set up.
   *
   * The returned URL will redirect to POWERPOINT_REDIRECT_URI after auth.
   */
  createAuthorizationUrl(auth0Sub: string): string {
    const clientId =
      this.configService.get<string>('POWERPOINT_CLIENT_ID') ||
      this.configService.get<string>('TEAMS_CLIENT_ID'); // Fallback to shared Azure App

    const redirectUri = this.configService.get<string>('POWERPOINT_REDIRECT_URI');
    const tenantId =
      this.configService.get<string>('TEAMS_TENANT_ID') || 'common';

    if (!clientId || !redirectUri) {
      throw new Error(
        'PowerPoint integration is not configured. Set POWERPOINT_CLIENT_ID and POWERPOINT_REDIRECT_URI.',
      );
    }

    const scopes = encodeURIComponent('openid profile email User.Read offline_access');
    const state = encodeURIComponent(auth0Sub);

    const url =
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize` +
      `?client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes}` +
      `&state=${state}` +
      `&prompt=select_account`;

    return url;
  }

  /**
   * Handles the Microsoft OAuth2 callback.
   * Exchanges the code for tokens, fetches the Microsoft user profile,
   * and saves the 'powerpoint' integration to the user's profile.
   */
  async handleCallback(code: string, state: string): Promise<void> {
    const clientId =
      this.configService.get<string>('POWERPOINT_CLIENT_ID') ||
      this.configService.get<string>('TEAMS_CLIENT_ID');

    const clientSecret =
      this.configService.get<string>('POWERPOINT_CLIENT_SECRET') ||
      this.configService.get<string>('TEAMS_CLIENT_SECRET');

    const redirectUri = this.configService.get<string>('POWERPOINT_REDIRECT_URI');
    const tenantId =
      this.configService.get<string>('TEAMS_TENANT_ID') || 'common';
    const auth0Sub = decodeURIComponent(state);

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('PowerPoint integration is not fully configured.');
    }

    // 1. Exchange the authorization code for access + refresh tokens
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      this.logger.error(`PowerPoint token exchange failed: ${errorText}`);
      throw new Error('Failed to exchange PowerPoint authorization code');
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
    };

    // 2. Fetch Microsoft profile to get the user's unique Microsoft Object ID
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      this.logger.error(`PowerPoint profile fetch failed: ${await profileResponse.text()}`);
      throw new Error('Failed to fetch Microsoft profile for PowerPoint');
    }

    const profile = (await profileResponse.json()) as { id: string; mail?: string; displayName?: string };
    const microsoftUserId = profile.id;

    // 3. Find our IEP user and save the integration
    const user = await this.usersService.findByAuth0Sub(auth0Sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove any existing PowerPoint integration and replace with fresh one
    await user.updateOne({ $pull: { integrations: { provider: 'powerpoint' } } });
    await user.updateOne({
      $push: {
        integrations: {
          provider: 'powerpoint',
          externalId: microsoftUserId,
          refreshToken: tokenData.refresh_token ?? null,
        },
      },
    });

    this.logger.log(
      `PowerPoint Add-in connected for user ${auth0Sub} (MS ID: ${microsoftUserId})`,
    );
  }

  /**
   * Called by the PowerPoint task pane on load.
   * The add-in passes the presentation's document.id (from Office.js) as presentationId.
   * If an event is already linked to this presentation, return it.
   * If the user is a registered host with PowerPoint connected, auto-create an event.
   */
  async getOrCreateEventForPresentation(
    presentationId: string,
    microsoftUserId?: string,
  ): Promise<EventDocument> {
    // 1. Check if this presentation is already linked to a Pulse event
    const existingEvent = await this.eventModel
      .findOne({
        'integrations.provider': 'powerpoint',
        'integrations.externalId': presentationId,
      })
      .exec();

    if (existingEvent) {
      return existingEvent;
    }

    // 2. If a host MS user ID was provided, try to auto-create an event
    if (microsoftUserId) {
      const hostUser = await this.usersService.findByPowerPointId(microsoftUserId);
      if (hostUser) {
        this.logger.log(
          `Auto-creating event for PowerPoint presentation ${presentationId} (Host MS ID: ${microsoftUserId})`,
        );
        const event = await this.eventsService.create(hostUser._id.toString(), {
          name: `PowerPoint Session ${new Date().toLocaleDateString()}`,
          description: 'Auto-created from PowerPoint Add-in',
          settings: {
            allowAnonymousQA: true,
            requireModeration: false,
            participantNames: true,
          },
        });

        event.integrations = [{ provider: 'powerpoint', externalId: presentationId }];
        await event.save();

        this.logger.log(
          `Auto-created IEP event ${event.eventCode} for presentation ${presentationId}`,
        );
        return event;
      }
    }

    throw new NotFoundException(
      'No event is linked to this presentation. Please connect using an event code.',
    );
  }

  /**
   * Called when the presenter manually enters an event code in the task pane.
   * Links the PowerPoint presentation (by its Office.js document.id) to a Pulse event.
   */
  async linkPresentationToEvent(
    presentationId: string,
    eventCode: string,
  ): Promise<void> {
    const event = await this.eventsService.findByEventCode(eventCode);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const alreadyLinked = event.integrations?.some(
      (i) => i.provider === 'powerpoint' && i.externalId === presentationId,
    );
    if (alreadyLinked) return;

    if (!event.integrations) {
      event.integrations = [];
    }

    // Replace any existing powerpoint link for this event and add the new one
    event.integrations = event.integrations.filter((i) => i.provider !== 'powerpoint');
    event.integrations.push({ provider: 'powerpoint', externalId: presentationId });

    await event.save();
    this.logger.log(
      `Manually linked IEP event ${event.eventCode} to PowerPoint presentation ${presentationId}`,
    );
  }
}
