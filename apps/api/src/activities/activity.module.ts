// apps/api/src/activities/activity.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityEntity, ActivityEntitySchema } from './activity.schema';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityEntity.name, schema: ActivityEntitySchema },
    ]),
    // EventsService is needed for ownership checks in ActivityService
    EventsModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService], // exported for RealtimeGateway
})
export class ActivityModule {}