// apps/api/src/responses/response.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseEntity, ResponseSchema } from './response.schema';
import { ResponseService } from './response.service';
import { ParticipantModule } from '../participants/participant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResponseEntity.name, schema: ResponseSchema },
    ]),
    ParticipantModule,
  ],
  providers: [ResponseService],
  exports: [ResponseService],
})
export class ResponseModule {}