import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurveySessionEntity, SurveySessionSchema } from './survey-session.schema';
import { SurveySessionService } from './survey-sessions.service';
import { SurveySessionController } from './survey-sessions.controller';
import { ActivityModule } from '../activities/activity.module';
import { ResponseModule } from '../responses/response.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SurveySessionEntity.name, schema: SurveySessionSchema }]),
    forwardRef(() => ActivityModule),
    forwardRef(() => ResponseModule),
    RealtimeModule,
    EventsModule,
  ],
  controllers: [SurveySessionController],
  providers: [SurveySessionService],
  exports: [SurveySessionService],
})
export class SurveySessionsModule {}
