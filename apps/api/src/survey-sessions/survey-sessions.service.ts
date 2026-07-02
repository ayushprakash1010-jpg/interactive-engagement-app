import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SurveySessionEntity, SurveySessionDocument } from './survey-session.schema';
import { ActivityService } from '../activities/activity.service';
import { EventsService } from '../events/events.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { forwardRef, Inject } from '@nestjs/common';
import { ServerEvents, rooms } from '@iep/types';
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
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
    private readonly eventsService: EventsService,
    private readonly realtimeGateway: RealtimeGateway,
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
    const session = await this.surveySessionModel.findOne({
      activityId: new Types.ObjectId(activityId),
      participantAnonId,
    }).exec();
    
    return session;
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

    const activity = await this.activityService.findById(dto.activityId);
    const config = activity.config as any;

    if (config.maxResponses && config.maxResponses > 0) {
      const { completed } = await this.getStats(dto.activityId);
      if (completed >= config.maxResponses && activity.status === 'live') {
        const eventId = activity.eventId.toString();
        await this.activityService.setStatus(dto.activityId, 'closed');
        await this.eventsService.setActiveActivity(eventId, null);
        this.realtimeGateway.server.to(rooms.event(eventId)).emit(ServerEvents.ACTIVITY_CLOSED, {
          activityId: dto.activityId,
        });
      }
    }

    return session;
  }

  async getStats(activityId: string): Promise<{ started: number; completed: number }> {
    const [started, completed] = await Promise.all([
      this.surveySessionModel.countDocuments({ activityId: new Types.ObjectId(activityId) }).exec(),
      this.surveySessionModel.countDocuments({ activityId: new Types.ObjectId(activityId), status: 'completed' }).exec(),
    ]);

    return { started, completed };
  }
}
