import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { GoogleSlidesService } from './google-slides.service';
import { EventsService } from '../events/events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/google-slides')
export class GoogleSlidesController {
  constructor(
    private readonly googleSlidesService: GoogleSlidesService,
    private readonly eventsService: EventsService,
  ) {}

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
  @UseGuards(JwtAuthGuard)
  @Post('link-presentation')
  async linkPresentation(
    @Req() req: any,
    @Query('presentationId') presentationId: string,
    @Query('eventCode') eventCode: string,
  ) {
    if (!presentationId || !eventCode) throw new UnauthorizedException('Missing parameters');
    
    // Verify ownership
    const event = await this.eventsService.findByEventCode(eventCode);
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId.toString() !== req.user.id) throw new UnauthorizedException('Only the host can link this event');

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
