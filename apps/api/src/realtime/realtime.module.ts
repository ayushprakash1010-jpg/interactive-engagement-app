import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { ParticipantModule } from '../participants/participant.module';

import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [EventsModule, ParticipantModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
