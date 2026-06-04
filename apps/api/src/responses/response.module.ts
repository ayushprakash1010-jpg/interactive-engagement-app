// apps/api/src/responses/response.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseEntity, ResponseSchema } from './response.schema';
import { ResponseService } from './response.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResponseEntity.name, schema: ResponseSchema }
    ]),
  ],
  providers: [ResponseService],
  exports: [ResponseService], // exported for RealtimeGateway
})
export class ResponseModule {}