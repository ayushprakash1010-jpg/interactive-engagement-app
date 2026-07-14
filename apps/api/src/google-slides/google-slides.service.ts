import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventsService } from '../events/events.service';
import { EventEntity, EventDocument } from '../events/event.schema';

@Injectable()
export class GoogleSlidesService {
  private readonly logger = new Logger(GoogleSlidesService.name);

  constructor(
    private readonly eventsService: EventsService,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Called by the Google Slides add-on sidebar on load.
   * If an event is already linked to this presentation, return it.
   */
  async getEventForPresentation(presentationId: string): Promise<EventDocument> {
    const existingEvent = await this.eventModel
      .findOne({
        'integrations.provider': 'google-slides',
        'integrations.externalId': presentationId,
      })
      .exec();

    if (existingEvent) {
      return existingEvent;
    }

    throw new NotFoundException(
      'No event is linked to this presentation. Please connect using an event code.',
    );
  }

  /**
   * Called when the presenter manually enters an event code in the sidebar.
   * Links the Google Slides presentation to a Pulse event.
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
      (i) => i.provider === 'google-slides' && i.externalId === presentationId,
    );
    if (alreadyLinked) return;

    if (!event.integrations) {
      event.integrations = [];
    }

    // Replace any existing google-slides link for this event and add the new one
    event.integrations = event.integrations.filter((i) => i.provider !== 'google-slides');
    event.integrations.push({ provider: 'google-slides', externalId: presentationId });

    await event.save();
    this.logger.log(
      `Manually linked IEP event ${event.eventCode} to Google Slides presentation ${presentationId}`,
    );
  }
}
