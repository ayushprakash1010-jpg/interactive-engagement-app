import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SurveySessionEntity, SurveySessionDocument } from './survey-session.schema';
import { ActivityService } from '../activities/activity.service';
import { ResponseService } from '../responses/response.service';

export interface StartSurveySessionDto {
  eventId: string;
  activityId: string;
  participantAnonId: string;
}

export interface CompleteSurveySessionDto {
  eventId: string;
  activityId: string;
  participantAnonId: string;
}

@Injectable()
export class SurveySessionService {
  constructor(
    @InjectModel(SurveySessionEntity.name)
    private readonly surveySessionModel: Model<SurveySessionDocument>,
    private readonly activityService: ActivityService,
    private readonly responseService: ResponseService,
  ) {}

  async startSession(dto: StartSurveySessionDto): Promise<SurveySessionDocument> {
    const activity = await this.activityService.findById(dto.activityId);

    if (activity.type !== 'survey') {
      throw new BadRequestException('Activity is not a survey');
    }

    if ((activity as unknown as { status: string }).status !== 'live') {
      throw new BadRequestException('Survey is not live');
    }

    const session = await this.surveySessionModel.findOneAndUpdate(
      {
        activityId: new Types.ObjectId(dto.activityId),
        participantAnonId: dto.participantAnonId,
      },
      {
        $setOnInsert: {
          eventId: activity.eventId,
          activityId: new Types.ObjectId(dto.activityId),
          participantAnonId: dto.participantAnonId,
          status: 'started',
          startedAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).exec();

    return session;
  }

  async getSession(activityId: string, participantAnonId: string): Promise<SurveySessionDocument | null> {
    return this.surveySessionModel.findOne({
      activityId: new Types.ObjectId(activityId),
      participantAnonId,
    }).exec();
  }

  async completeSession(dto: CompleteSurveySessionDto): Promise<SurveySessionDocument> {
    const session = await this.surveySessionModel.findOneAndUpdate(
      {
        activityId: new Types.ObjectId(dto.activityId),
        participantAnonId: dto.participantAnonId,
      },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).exec();

    if (!session) {
      throw new NotFoundException('Survey session not found');
    }

    return session;
  }
}
