import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { ParticipantModule } from '../participants/participant.module';
import { ActivityModule } from '../activities/activity.module';
import { ResponseModule } from '../responses/response.module';
import { QuestionsModule } from '../questions/questions.module';

import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [
    EventsModule,
    ParticipantModule,
    ActivityModule,   // ← Sprint 3: provides ActivityService to the gateway
    ResponseModule,   // ← Sprint 3: provides ResponseService to the gateway
    QuestionsModule,  // ← Sprint 4: provides QuestionsService to the gateway
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}