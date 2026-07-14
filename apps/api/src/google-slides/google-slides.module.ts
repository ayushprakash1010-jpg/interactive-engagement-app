import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GoogleSlidesController } from './google-slides.controller';
import { GoogleSlidesService } from './google-slides.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { EventEntity, EventEntitySchema } from '../events/event.schema';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EventsModule,
    MongooseModule.forFeature([{ name: EventEntity.name, schema: EventEntitySchema }]),
  ],
  controllers: [GoogleSlidesController],
  providers: [GoogleSlidesService],
})
export class GoogleSlidesModule {}
