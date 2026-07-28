import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationEntity, OrganizationEntitySchema } from './organization.schema';
import { UserEntity, UserEntitySchema } from '../users/user.schema';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationEntity.name, schema: OrganizationEntitySchema },
      { name: UserEntity.name, schema: UserEntitySchema },
    ]),
    BillingModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
