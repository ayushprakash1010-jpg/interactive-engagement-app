import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
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
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
