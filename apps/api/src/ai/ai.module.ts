import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ActivityEntity, ActivityEntitySchema } from '../activities/activity.schema';
import { ResponseEntity, ResponseSchema } from '../responses/response.schema';
import { QuestionEntity, QuestionEntitySchema } from '../questions/question.schema';
import { EventEntity, EventEntitySchema } from '../events/event.schema';
import { UserEntity, UserEntitySchema } from '../users/user.schema';
import { EventsModule } from '../events/events.module';
import { AuthModule } from '../auth/auth.module';

import { AiOperationLogEntity, AiOperationLogSchema } from './ai-operation-log.schema';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityEntity.name, schema: ActivityEntitySchema },
      { name: ResponseEntity.name, schema: ResponseSchema },
      { name: QuestionEntity.name, schema: QuestionEntitySchema },
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: UserEntity.name, schema: UserEntitySchema },
      { name: AiOperationLogEntity.name, schema: AiOperationLogSchema },
    ]),
    EventsModule,
    AuthModule,
    RealtimeModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}