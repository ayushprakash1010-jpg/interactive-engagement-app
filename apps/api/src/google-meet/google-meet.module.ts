import { Module } from '@nestjs/common';
import { GoogleMeetController } from './google-meet.controller';
import { GoogleMeetService } from './google-meet.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEntity, EventEntitySchema } from '../events/event.schema';

@Module({
  imports: [
    UsersModule,
    EventsModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
    ]),
  ],
  controllers: [GoogleMeetController],
  providers: [GoogleMeetService],
  exports: [GoogleMeetService],
})
export class GoogleMeetModule {}
