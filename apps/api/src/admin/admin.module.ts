import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminPublicController } from './admin-public.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { EventEntity, EventEntitySchema } from '../events/event.schema';
import { UserEntity, UserEntitySchema } from '../users/user.schema';
import { RealtimeModule } from '../realtime/realtime.module';
import { EventsModule } from '../events/events.module';
import { AdminAuditLogEntity, AdminAuditLogEntitySchema } from './audit-log.schema';
import { OrganizationEntity, OrganizationEntitySchema } from '../organizations/organization.schema';
import { AiOperationLogEntity, AiOperationLogSchema } from '../ai/ai-operation-log.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: UserEntity.name, schema: UserEntitySchema },
      { name: AdminAuditLogEntity.name, schema: AdminAuditLogEntitySchema },
      { name: OrganizationEntity.name, schema: OrganizationEntitySchema },
      { name: AiOperationLogEntity.name, schema: AiOperationLogSchema },
    ]),
    RealtimeModule,
    EventsModule,
  ],
  controllers: [AdminPublicController, AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
