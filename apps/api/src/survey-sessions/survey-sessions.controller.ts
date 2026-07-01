import { Controller, Post, Get, Param, Body, Patch, HttpCode, HttpStatus, Ip, HttpException, Inject, forwardRef, Res } from '@nestjs/common';
import { SurveySessionService } from './survey-sessions.service';
import { ResponseService } from '../responses/response.service';
import { RateLimitService } from '../realtime/rate-limit.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ActivityService } from '../activities/activity.service';
import { z } from 'zod';

// For participants, they might not be fully authenticated with JWT, they might use anonymous tokens or it might be an open endpoint.
// Let's assume standard participant authentication if it exists, or just taking anonId from body.
// Based on existing app, participants pass participantAnonId in the body for REST APIs.

const StartSessionSchema = z.object({
  participantAnonId: z.string().min(1),
});

const CompleteSessionSchema = z.object({
  participantAnonId: z.string().min(1),
});

const SaveSurveyAnswerSchema = z.object({
  participantAnonId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionIds: z.array(z.string()).optional(),
  textValue: z.string().max(2000).optional(),
  ratingValue: z.number().optional(),
}).refine(
  (data) =>
    data.selectedOptionIds !== undefined ||
    data.textValue !== undefined ||
    data.ratingValue !== undefined,
  {
    message: 'At least one answer field is required',
  }
);

@Controller('events/:eventId/activities/:activityId/survey')
export class SurveySessionController {
  constructor(
    private readonly surveySessionService: SurveySessionService,
    private readonly responseService: ResponseService,
    private readonly rateLimitService: RateLimitService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
  ) {}

  private async enforceRateLimit(action: string, anonId: string, ip?: string) {
    const result = await this.rateLimitService.consumeForAction(action, anonId, ip);
    if (!result.allowed) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  @Post('session')
  @HttpCode(HttpStatus.OK)
  async startSession(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
    @Body(new ZodValidationPipe(StartSessionSchema)) body: { participantAnonId: string },
    @Ip() ip: string,
  ) {
    await this.enforceRateLimit('activity:respond', body.participantAnonId, ip);

    return this.surveySessionService.startSession({
      eventId,
      activityId,
      participantAnonId: body.participantAnonId,
    });
  }

  @Get('session/:participantAnonId')
  async getSession(
    @Param('activityId') activityId: string,
    @Param('participantAnonId') participantAnonId: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const session = await this.surveySessionService.getSession(activityId, participantAnonId);
    if (!session) {
      res.status(204);
      return;
    }
    return session;
  }

  @Get('stats')
  async getStats(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
  ) {
    return this.surveySessionService.getStats(activityId);
  }

  @Patch('answer')
  @HttpCode(HttpStatus.OK)
  async saveAnswer(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
    @Body(new ZodValidationPipe(SaveSurveyAnswerSchema)) body: z.infer<typeof SaveSurveyAnswerSchema>,
    @Ip() ip: string,
  ) {
    await this.enforceRateLimit('activity:respond', body.participantAnonId, ip);

    const activity = await this.activityService.findById(activityId);

    return await this.responseService.saveSurveyAnswer({
      eventId: activity.eventId.toString(),
      activityId,
      participantAnonId: body.participantAnonId,
      questionId: body.questionId,
      selectedOptionIds: body.selectedOptionIds,
      textValue: body.textValue,
      ratingValue: body.ratingValue,
    });
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeSession(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
    @Body(new ZodValidationPipe(CompleteSessionSchema)) body: { participantAnonId: string },
    @Ip() ip: string,
  ) {
    await this.enforceRateLimit('activity:respond', body.participantAnonId, ip);

    return this.surveySessionService.completeSession({
      eventId,
      activityId,
      participantAnonId: body.participantAnonId,
    });
  }
}
