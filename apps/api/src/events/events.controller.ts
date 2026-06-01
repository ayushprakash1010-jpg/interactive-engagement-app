// apps/api/src/events/events.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  createEventSchema,
  updateEventSchema,
  CreateEvent,
  UpdateEvent,
} from '@iep/types';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EventsService } from './events.service';

/**
 * All event endpoints are host-only: the JwtAuthGuard verifies the Auth0
 * access token, upserts the user, and attaches it as req.user. The host id
 * comes from the verified token — never from the client — so a host can only
 * ever read or mutate their own events.
 */
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser('_id') hostId: string,
    @Body(new ZodValidationPipe(createEventSchema))
    dto: CreateEvent,
  ) {
    return this.eventsService.create(hostId, dto);
  }

  @Get()
  findAll(@CurrentUser('_id') hostId: string) {
    return this.eventsService.findAllByHost(hostId);
  }

  @Get(':id')
  findOne(@CurrentUser('_id') hostId: string, @Param('id') id: string) {
    return this.eventsService.findOne(id, hostId);
  }

  @Get(':id/qr')
  getQr(@CurrentUser('_id') hostId: string, @Param('id') id: string) {
    return this.eventsService.getQr(id, hostId);
  }

  @Patch(':id')
  update(
    @CurrentUser('_id') hostId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEventSchema))
    dto: UpdateEvent,
  ) {
    return this.eventsService.update(id, hostId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser('_id') hostId: string, @Param('id') id: string) {
    return this.eventsService.remove(id, hostId);
  }
}
