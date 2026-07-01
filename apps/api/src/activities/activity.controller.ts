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
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1).max(200),
      }),
    )
    .optional(),
  ratingScale: z.number().int().min(2).max(10).optional(),
  timeLimitSec: z.number().int().min(5).max(600).optional(), 
});

const QuizQuestionSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1).max(500),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1).max(200),
        }),
      )
      .min(2),
    correctOptionId: z.string().min(1),
    points: z.number().int().min(1).max(1000),
    timeLimitSec: z.number().int().min(5).max(300),
  })
  .superRefine((question, ctx) => {
    const optionIds = question.options.map((option) => option.id);
    const uniqueOptionIds = new Set(optionIds);

    if (uniqueOptionIds.size !== optionIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Quiz question option ids must be unique',
        path: ['options'],
      });
    }

    if (!optionIds.includes(question.correctOptionId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'correctOptionId must match one of the option ids',
        path: ['correctOptionId'],
      });
    }
  });

const QuizConfigSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
  speedBonusEnabled: z.boolean().optional().default(false),
});

// Bounds mirror @iep/types wordcloudConfigSchema (the authoritative source).
const WordcloudConfigSchema = z.object({
  prompt: z.string().min(1).max(500),
  maxWordsPerParticipant: z.number().int().min(1).max(20),
  timeLimitSec: z.number().int().min(5).max(600).optional(),
});

const FeedbackFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['rating', 'text']),
  label: z.string().min(1).max(200),
});

const FeedbackConfigSchema = z.object({
  prompt: z.string().min(1).max(500),
  fields: z.array(FeedbackFieldSchema).min(1),
  timeLimitSec: z.number().int().min(5).max(600).optional(), // <--- THE FINAL FIX IS HERE!
});

const SurveyQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['single', 'multiple', 'rating', 'open']),
  text: z.string().min(1).max(500),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1).max(200),
      }),
    )
    .optional(),
  ratingScale: z.number().int().min(2).max(10).optional(),
  required: z.boolean().optional().default(true),
  pageIndex: z.number().int().min(0).default(0),
});

const SurveyConfigSchema = z.object({
  welcomeMessage: z.string().optional(),
  thankYouMessage: z.string().optional(),
  displayMode: z.enum(['stepper', 'scroll']).optional().default('stepper'),
  questions: z.array(SurveyQuestionSchema).default([]),
  timeLimitSec: z.number().int().min(5).max(600).optional(),
});

const CreateActivitySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('poll'),
    title: z.string().min(1).max(200),
    config: PollConfigSchema,
  }),
  z.object({
    type: z.literal('quiz'),
    title: z.string().min(1).max(200),
    config: QuizConfigSchema,
  }),
  z.object({
    type: z.literal('wordcloud'),
    title: z.string().min(1).max(200),
    config: WordcloudConfigSchema,
  }),
  z.object({
    type: z.literal('feedback'),
    title: z.string().min(1).max(200),
    config: FeedbackConfigSchema,
  }),
  z.object({
    type: z.literal('survey'),
    title: z.string().min(1).max(200),
    config: SurveyConfigSchema,
  }),
]);

const UpdateActivitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  config: z
    .union([
      PollConfigSchema,
      QuizConfigSchema,
      WordcloudConfigSchema,
      FeedbackConfigSchema,
      SurveyConfigSchema,
    ])
    .optional(),
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