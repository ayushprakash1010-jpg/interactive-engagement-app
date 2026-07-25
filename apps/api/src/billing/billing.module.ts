/**
 * billing.module.ts
 *
 * Wires together the 3 billing services and exposes them for other modules.
 *
 * Exports:
 *  - PlanService      (used by RealtimeModule, AiModule for plan resolution)
 *  - UsageService     (used by RealtimeGateway, AiController for quota checks)
 *  - EntitlementService (used by PlanGuard)
 *  - PlanGuard        (importable for use in other modules' route decorators)
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationEntity, OrganizationEntitySchema } from '../organizations/organization.schema';
import { UsageEntity, UsageEntitySchema } from './usage.schema';
import { PlanService } from './plan.service';
import { UsageService } from './usage.service';
import { EntitlementService } from './entitlement.service';
import { PlanGuard } from './plan.guard';
import { BillingController } from './billing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationEntity.name, schema: OrganizationEntitySchema },
      { name: UsageEntity.name, schema: UsageEntitySchema },
    ]),
  ],
  providers: [PlanService, UsageService, EntitlementService, PlanGuard],
  controllers: [BillingController],
  exports: [PlanService, UsageService, EntitlementService, PlanGuard],
})
export class BillingModule {}
