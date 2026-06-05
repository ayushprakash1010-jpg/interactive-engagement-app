// apps/api/src/activities/activity.controller.ts
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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ActivityService,
  CreateActivityDto,
  UpdateActivityDto,
} from './activity.service';
import { z } from 'zod';

interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

const PollConfigSchema = z.object({
  pollType: z.enum(['single', 'multiple', 'rating', 'open']),
  question: z.string().min(1).max(500),
  options: z
    .array(z.object({ id: z.string(), label: z.string() }))
    .optional(),
  ratingScale: z.number().int().min(2).max(10).optional(),
});

const CreateActivitySchema = z.object({
  type: z.enum(['poll', 'quiz', 'wordcloud', 'feedback']),
  title: z.string().min(1).max(200),
  config: PollConfigSchema.passthrough(),
});

const UpdateActivitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  config: PollConfigSchema.passthrough().optional(),
});

const ReorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

@UseGuards(JwtAuthGuard)
@Controller('events/:eventId/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('eventId') eventId: string,
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(CreateActivitySchema)) dto: CreateActivityDto,
  ) {
    return this.activityService.create(eventId, req.user._id, dto);
  }

  @Get()
  findAll(
    @Param('eventId') eventId: string,
    @Req() req: AuthRequest,
  ) {
    return this.activityService.findAllByEvent(eventId, req.user._id);
  }

  @Get(':id')
  findOne(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ) {
    return this.activityService.findOne(id, eventId);
  }

  // NOTE: this static route MUST be declared before the dynamic `@Patch(':id')`
  // below, otherwise Express matches "reorder" as an :id and this handler is
  // never reached (the request 404s inside update()).
  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(
    @Param('eventId') eventId: string,
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(ReorderSchema)) body: { orderedIds: string[] },
  ) {
    return this.activityService.reorder(eventId, req.user._id, body.orderedIds);
  }

  @Patch(':id')
  update(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(UpdateActivitySchema)) dto: UpdateActivityDto,
  ) {
    return this.activityService.update(id, eventId, req.user._id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return this.activityService.remove(id, eventId, req.user._id);
  }
}