import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportTicketEntity, SupportTicketSchema } from './schemas/support-ticket.schema';
import { AdminModule } from '../admin/admin.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicketEntity.name, schema: SupportTicketSchema },
    ]),
    AdminModule, // For audit logging
    UsersModule, // For auto-associating tickets
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
