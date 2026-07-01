import { Controller, Post, Get, Param, Body, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { SurveySessionService } from './survey-sessions.service';
import { ResponseService } from '../responses/response.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
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
  ) {}

  @Post('session')
  @HttpCode(HttpStatus.OK)
  async startSession(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
    @Body(new ZodValidationPipe(StartSessionSchema)) body: { participantAnonId: string },
  ) {
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
  ) {
    return this.surveySessionService.getSession(activityId, participantAnonId);
  }

  @Patch('answer')
  @HttpCode(HttpStatus.OK)
  async saveAnswer(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
    @Body(new ZodValidationPipe(SaveSurveyAnswerSchema)) body: z.infer<typeof SaveSurveyAnswerSchema>,
  ) {
    return this.responseService.saveSurveyAnswer({
      eventId,
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
  ) {
    return this.surveySessionService.completeSession({
      eventId,
      activityId,
      participantAnonId: body.participantAnonId,
    });
  }
}
