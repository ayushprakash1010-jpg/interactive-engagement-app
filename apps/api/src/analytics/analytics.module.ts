import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsExportService } from './analytics-export.service';
import { EventEntity, EventEntitySchema } from '../events/event.schema';
import { ActivityEntity, ActivityEntitySchema } from '../activities/activity.schema';
import { ResponseEntity, ResponseSchema } from '../responses/response.schema';
import { QuestionEntity, QuestionEntitySchema } from '../questions/question.schema';
import {
  ParticipantEntity,
  ParticipantEntitySchema,
} from '../participants/participant.schema';
import {
  SurveySessionEntity,
  SurveySessionSchema,
} from '../survey-sessions/survey-session.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../realtime/redis.module';
import { WorkspaceOverviewController } from './workspace-overview.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: ActivityEntity.name, schema: ActivityEntitySchema },
      { name: ResponseEntity.name, schema: ResponseSchema },
      { name: QuestionEntity.name, schema: QuestionEntitySchema },
      { name: ParticipantEntity.name, schema: ParticipantEntitySchema },
      { name: SurveySessionEntity.name, schema: SurveySessionSchema },
    ]),
    UsersModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AnalyticsController, WorkspaceOverviewController],
  providers: [AnalyticsService, AnalyticsExportService],
  exports: [AnalyticsService, AnalyticsExportService],
})
export class AnalyticsModule { }