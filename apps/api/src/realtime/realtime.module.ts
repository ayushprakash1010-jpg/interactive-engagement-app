import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { ParticipantModule } from '../participants/participant.module';
import { ActivityModule } from '../activities/activity.module';
import { ResponseModule } from '../responses/response.module';
import { QuestionsModule } from '../questions/questions.module';
import { AnalyticsModule } from '../analytics/analytics.module';

import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [
    EventsModule,
    ParticipantModule,
    ActivityModule,
    ResponseModule,
    QuestionsModule,
    AnalyticsModule,
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}