import { Module } from '@nestjs/common';
import { ZoomController } from './zoom.controller';
import { ZoomService } from './zoom.service';
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
  controllers: [ZoomController],
  providers: [ZoomService],
})
export class ZoomModule {}
