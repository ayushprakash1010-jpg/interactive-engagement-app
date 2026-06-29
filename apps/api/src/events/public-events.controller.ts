import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events/lookup')
export class PublicEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(':code')
  async lookupEvent(@Param('code') code: string) {
    const event = await this.eventsService.findByEventCode(code);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      id: event._id.toString(),
      name: event.name,
      eventCode: event.eventCode,
      status: event.status,
      settings: event.settings,
    };
  }
}
