import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEntity, EventEntitySchema } from './event.schema';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { AuthModule } from '../auth/auth.module';
import { UserEntity, UserEntitySchema } from '../users/user.schema';

import { PublicEventsController } from './public-events.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: UserEntity.name, schema: UserEntitySchema },
    ]),
    // Provides JwtAuthGuard + the registered 'jwt' Passport strategy.
    AuthModule,
  ],
  controllers: [EventsController, PublicEventsController],
  providers: [EventsService],
  exports: [EventsService], // exported for use in RealtimeGateway (Sprint 2+)
})
export class EventsModule {}