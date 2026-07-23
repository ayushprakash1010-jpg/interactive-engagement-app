import { Injectable, OnModuleInit, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeatureFlagEntity, FeatureFlagDocument } from './feature-flag.schema';
import { AdminAuditLogEntity, AdminAuditLogDocument } from '../admin/audit-log.schema';

import { IsString, IsNotEmpty, IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreateFeatureFlagDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Key must be a lowercase slug containing only letters, numbers, and hyphens' })
  key!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsBoolean()
  isGlobalEnabled!: boolean;
}

export class UpdateFeatureFlagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isGlobalEnabled?: boolean;
}

@Injectable()
export class FeatureFlagsService implements OnModuleInit {
  private readonly logger = new Logger(FeatureFlagsService.name);
  
  // In-memory cache for ultra-fast, zero-DB evaluation
  private flagsCache = new Map<string, FeatureFlagDocument>();

  constructor(
    @InjectModel(FeatureFlagEntity.name)
    private readonly featureFlagModel: Model<FeatureFlagDocument>,
    @InjectModel(AdminAuditLogEntity.name)
    private readonly auditLogModel: Model<AdminAuditLogDocument>,
  ) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  /**
   * Refreshes the in-memory cache from MongoDB.
   * If MongoDB is unreachable, the cache remains safely empty.
   */
  async refreshCache() {
    try {
      const flags = await this.featureFlagModel.find().exec();
      const newCache = new Map<string, FeatureFlagDocument>();
      for (const flag of flags) {
        newCache.set(flag.key, flag);
      }
      this.flagsCache = newCache;
      this.logger.log(`Loaded ${this.flagsCache.size} feature flags into memory cache`);
    } catch (error) {
      this.logger.error('Failed to load feature flags from MongoDB', error);
      // Fail safely: keep the cache empty so flags default to false
    }
  }

  /**
   * Evaluates all feature flags for a specific organization.
   * Returns a simple map of { 'flag-key': true/false }
   */
  evaluateAllForUser(organizationId?: string | null): Record<string, boolean> {
    const result: Record<string, boolean> = {};

    for (const [key, flag] of this.flagsCache.entries()) {
      if (organizationId && flag.organizationOverrides?.has(organizationId)) {
        // Precedence 1: Organization Override
        result[key] = flag.organizationOverrides.get(organizationId)!;
      } else {
        // Precedence 2: Global Setting
        result[key] = flag.isGlobalEnabled;
      }
    }

    return result;
  }

  // --- Admin Mutations (Always sync cache immediately) ---

  async listAll(): Promise<FeatureFlagDocument[]> {
    return Array.from(this.flagsCache.values());
  }

  async create(dto: CreateFeatureFlagDto, adminIdentity: { id: string, email: string }): Promise<FeatureFlagDocument> {
    const existing = await this.featureFlagModel.findOne({ key: dto.key });
    if (existing) {
      throw new BadRequestException(`Feature flag with key '${dto.key}' already exists.`);
    }

    try {
      const flag = await this.featureFlagModel.create({
        key: dto.key,
        name: dto.name,
        description: dto.description,
        isGlobalEnabled: dto.isGlobalEnabled,
        organizationOverrides: {},
      });

      await this.auditLogModel.create({
        adminId: adminIdentity.id,
        adminEmail: adminIdentity.email,
        actionType: 'FEATURE_FLAG_CREATED',
        targetResourceType: 'System',
        targetResourceId: flag.key,
        metadata: { newValue: dto.isGlobalEnabled, targetScope: 'Global' },
      });

      this.flagsCache.set(flag.key, flag);
      return flag;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(`Failed to create flag. Ensure key is unique.`);
      }
      throw error;
    }
  }

  async update(key: string, dto: UpdateFeatureFlagDto, adminIdentity: { id: string, email: string }): Promise<FeatureFlagDocument> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found.`);
    }

    const previousValue = flag.isGlobalEnabled;

    if (dto.name !== undefined) flag.name = dto.name;
    if (dto.description !== undefined) flag.description = dto.description;
    if (dto.isGlobalEnabled !== undefined) flag.isGlobalEnabled = dto.isGlobalEnabled;

    await flag.save();

    if (dto.isGlobalEnabled !== undefined && dto.isGlobalEnabled !== previousValue) {
      await this.auditLogModel.create({
        adminId: adminIdentity.id,
        adminEmail: adminIdentity.email,
        actionType: 'FEATURE_FLAG_UPDATED',
        targetResourceType: 'System',
        targetResourceId: flag.key,
        metadata: { previousValue, newValue: dto.isGlobalEnabled, targetScope: 'Global' },
      });
    }

    this.flagsCache.set(flag.key, flag);
    return flag;
  }

  async setOrganizationOverride(key: string, organizationId: string, isEnabled: boolean, adminIdentity: { id: string, email: string }): Promise<FeatureFlagDocument> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found.`);
    }

    const overrides = flag.organizationOverrides || new Map<string, boolean>();
    const previousValue = overrides.get(organizationId);
    
    overrides.set(organizationId, isEnabled);
    flag.organizationOverrides = overrides;

    await flag.save();

    await this.auditLogModel.create({
      adminId: adminIdentity.id,
      adminEmail: adminIdentity.email,
      actionType: 'FEATURE_FLAG_OVERRIDE_SET',
      targetResourceType: 'System',
      targetResourceId: flag.key,
      metadata: { organizationId, previousValue, newValue: isEnabled, targetScope: 'Organization' },
    });

    this.flagsCache.set(flag.key, flag);
    return flag;
  }

  async removeOrganizationOverride(key: string, organizationId: string, adminIdentity: { id: string, email: string }): Promise<FeatureFlagDocument> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found.`);
    }

    if (flag.organizationOverrides?.has(organizationId)) {
      const previousValue = flag.organizationOverrides.get(organizationId);
      flag.organizationOverrides.delete(organizationId);
      await flag.save();

      await this.auditLogModel.create({
        adminId: adminIdentity.id,
        adminEmail: adminIdentity.email,
        actionType: 'FEATURE_FLAG_OVERRIDE_REMOVED',
        targetResourceType: 'System',
        targetResourceId: flag.key,
        metadata: { organizationId, previousValue, targetScope: 'Organization' },
      });

      this.flagsCache.set(flag.key, flag);
    }
    
    return flag;
  }

  async delete(key: string, adminIdentity: { id: string, email: string }): Promise<void> {
    const flag = await this.featureFlagModel.findOne({ key });
    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found.`);
    }

    await this.featureFlagModel.deleteOne({ key });

    await this.auditLogModel.create({
      adminId: adminIdentity.id,
      adminEmail: adminIdentity.email,
      actionType: 'FEATURE_FLAG_DELETED',
      targetResourceType: 'System',
      targetResourceId: key,
      metadata: {},
    });

    this.flagsCache.delete(key);
  }
}
