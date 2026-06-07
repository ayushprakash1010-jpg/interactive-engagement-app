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
  exports: [ParticipantService, MongooseModule],
})
export class ParticipantModule {}