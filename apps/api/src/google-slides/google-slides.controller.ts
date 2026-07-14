import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleSlidesService } from './google-slides.service';

@Controller('api/google-slides')
export class GoogleSlidesController {
  constructor(private readonly googleSlidesService: GoogleSlidesService) {}

  /**
   * Called by the Google Slides sidebar on load.
   * Returns the IEP event code linked to this presentation.
   */
  @Get('context-to-event')
  async contextToEvent(@Query('presentationId') presentationId: string) {
    if (!presentationId) {
      throw new UnauthorizedException('Missing presentationId');
    }
    const event = await this.googleSlidesService.getEventForPresentation(presentationId);
    return { eventCode: event.eventCode };
  }

  /**
   * Called when the user manually enters an event code inside the sidebar.
   * Links the presentation to the given Pulse event.
   */
  @Get('link-presentation')
  async linkPresentation(
    @Query('presentationId') presentationId: string,
    @Query('eventCode') eventCode: string,
  ) {
    if (!presentationId || !eventCode) {
      throw new UnauthorizedException('Missing presentationId or eventCode');
    }
    await this.googleSlidesService.linkPresentationToEvent(presentationId, eventCode);
    return { success: true };
  }

  /**
   * Health check
   */
  @Get('status')
  status() {
    return {
      configured: true,
      provider: 'google-slides',
      note: 'Uses Google Workspace Add-ons.',
    };
  }
}
