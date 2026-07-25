import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SubscriptionEntity, SubscriptionDocument } from './subscription.schema';
import { SubscriptionHistoryEntity, SubscriptionHistoryDocument } from './subscription-history.schema';
import { OrganizationEntity, OrganizationDocument } from '../organizations/organization.schema';
import { MigrationEntity, MigrationDocument } from './migration.schema';
import { PlanTier, isValidPlanTier } from './plan-config';

@Injectable()
export class SubscriptionMigrationService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionMigrationService.name);

  constructor(
    @InjectModel(SubscriptionEntity.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(SubscriptionHistoryEntity.name)
    private readonly historyModel: Model<SubscriptionHistoryDocument>,
    @InjectModel(OrganizationEntity.name)
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(MigrationEntity.name)
    private readonly migrationModel: Model<MigrationDocument>,
  ) {}

  async onModuleInit() {
    await this.runBillingSubscriptionV1Migration();
  }

  private async runBillingSubscriptionV1Migration() {
    const migrationId = 'billing-subscription-v1';

    // Check if migration has already run
    const existingMigration = await this.migrationModel.findOne({ migrationId }).exec();
    if (existingMigration) {
      this.logger.log(`Migration ${migrationId} already completed. Skipping.`);
      return;
    }

    this.logger.log(`Starting migration: ${migrationId}`);

    // Find orgs that do NOT have a subscriptionId set
    const legacyOrgs = await this.orgModel.find({
      $or: [
        { subscriptionId: null },
        { subscriptionId: { $exists: false } },
      ],
    }).exec();

    if (legacyOrgs.length === 0) {
      this.logger.log('No legacy organizations found. Marking migration as complete.');
      await this.migrationModel.create({ migrationId });
      return;
    }

    this.logger.log(`Found ${legacyOrgs.length} legacy organizations. Running two-phase migration to create subscriptions...`);

    let migratedCount = 0;
    for (const org of legacyOrgs) {
      try {
        const orgId = org._id as Types.ObjectId;
        const legacyPlanRaw = org.plan;
        const planTier: PlanTier = isValidPlanTier(legacyPlanRaw) ? legacyPlanRaw : 'free';

        // 1. Create Subscription
        const sub = await this.subscriptionModel.findOneAndUpdate(
          { organizationId: orgId },
          { $set: { plan: planTier, status: 'active' } },
          { upsert: true, new: true }
        );

        // 2. Create history record
        await this.historyModel.create({
          organizationId: orgId,
          subscriptionId: sub._id,
          previousPlan: 'legacy_migration',
          newPlan: planTier,
          reason: 'Startup Migration Phase A',
        });

        // 3. Update Org: ONLY set subscriptionId. Do NOT $unset the legacy plan field yet.
        await this.orgModel.updateOne(
          { _id: orgId },
          {
            $set: { subscriptionId: sub._id }
          }
        );

        migratedCount++;
      } catch (err) {
        this.logger.error(`Failed to migrate organization ${org._id}`, err);
      }
    }

    this.logger.log(`Successfully migrated ${migratedCount}/${legacyOrgs.length} organizations to subscriptions.`);
    
    // Mark as complete so it never runs again
    await this.migrationModel.create({ migrationId });
    this.logger.log(`Migration ${migrationId} marked as completed.`);
  }
}
