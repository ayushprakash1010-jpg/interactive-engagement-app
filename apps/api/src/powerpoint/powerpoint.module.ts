import { Module } from '@nestjs/common';
import { PowerPointController } from './powerpoint.controller';
import { PowerPointService } from './powerpoint.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEntity, EventEntitySchema } from '../events/event.schema';

@Module({
  imports: [
    UsersModule,
    EventsModule,
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
    ]),
  ],
  controllers: [PowerPointController],
  providers: [PowerPointService],
})
export class PowerPointModule {}
