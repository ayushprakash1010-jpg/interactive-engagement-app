import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { EventEntity, EventEntitySchema } from '../events/event.schema';
import { UserEntity, UserEntitySchema } from '../users/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: EventEntity.name, schema: EventEntitySchema },
      { name: UserEntity.name, schema: UserEntitySchema },
    ]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
