// apps/api/src/participants/participant.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipantEntity, ParticipantEntitySchema } from './participant.schema';
import { ParticipantService } from './participant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParticipantEntity.name, schema: ParticipantEntitySchema },
    ]),
  ],
  providers: [ParticipantService],
  exports: [ParticipantService], // exported for use in RealtimeGateway (Sprint 2)
})
export class ParticipantModule {}
