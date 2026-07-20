import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { EventEntity, EventEntitySchema } from '../events/event.schema';
import { UserEntity, UserEntitySchema } from '../users/user.schema';
import { RealtimeModule } from '../realtime/realtime.module';
import { EventsModule } from '../events/events.module';
import { AdminAuditLogEntity, AdminAuditLogEntitySchema } from './audit-log.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: UserEntity.name, schema: UserEntitySchema },
      { name: AdminAuditLogEntity.name, schema: AdminAuditLogEntitySchema },
    ]),
    RealtimeModule,
    EventsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
