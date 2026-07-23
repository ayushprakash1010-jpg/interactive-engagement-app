import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureFlagEntity, FeatureFlagEntitySchema } from './feature-flag.schema';
import { FeatureFlagsService } from './feature-flags.service';
import { AdminFeatureFlagsController } from './admin-feature-flags.controller';
import { FeatureFlagsController } from './feature-flags.controller';
import { AdminAuditLogEntity, AdminAuditLogEntitySchema } from '../admin/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeatureFlagEntity.name, schema: FeatureFlagEntitySchema },
      { name: AdminAuditLogEntity.name, schema: AdminAuditLogEntitySchema },
    ]),
  ],
  controllers: [AdminFeatureFlagsController, FeatureFlagsController],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
