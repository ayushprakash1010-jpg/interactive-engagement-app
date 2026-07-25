/**
 * billing.module.ts
 *
 * Wires together the 3 billing services and exposes them for other modules.
 *
 * Exports:
 *  - SubscriptionService (used by RealtimeModule, AiModule for plan resolution)
 *  - PlanDefinitionService (used for feature lookups)
 *  - UsageService     (used by RealtimeGateway, AiController for quota checks)
 *  - EntitlementService (used by PlanGuard)
 *  - PlanGuard        (importable for use in other modules' route decorators)
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationEntity, OrganizationEntitySchema } from '../organizations/organization.schema';
import { UsageEntity, UsageEntitySchema } from './usage.schema';
import { MigrationEntity, MigrationEntitySchema } from './migration.schema';
import { SubscriptionHistoryEntity, SubscriptionHistoryEntitySchema } from './subscription-history.schema';
import { SubscriptionEntity, SubscriptionEntitySchema } from './subscription.schema';
import { SubscriptionMigrationService } from './subscription.migration.service';
import { SubscriptionService } from './subscription.service';
import { PlanDefinitionService } from './plan-definition.service';
import { UsageService } from './usage.service';
import { EntitlementService } from './entitlement.service';
import { PlanGuard } from './plan.guard';
import { BillingController } from './billing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationEntity.name, schema: OrganizationEntitySchema },
      { name: UsageEntity.name, schema: UsageEntitySchema },
      { name: SubscriptionEntity.name, schema: SubscriptionEntitySchema },
      { name: SubscriptionHistoryEntity.name, schema: SubscriptionHistoryEntitySchema },
      { name: MigrationEntity.name, schema: MigrationEntitySchema },
    ]),
  ],
  providers: [SubscriptionMigrationService, SubscriptionService, PlanDefinitionService, UsageService, EntitlementService, PlanGuard],
  controllers: [BillingController],
  exports: [SubscriptionService, PlanDefinitionService, UsageService, EntitlementService, PlanGuard],
})
export class BillingModule {}
