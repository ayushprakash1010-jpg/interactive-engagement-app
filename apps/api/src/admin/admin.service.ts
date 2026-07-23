import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from '../users/user.schema';
import { EventEntity, EventDocument } from '../events/event.schema';
import { OrganizationEntity, OrganizationDocument } from '../organizations/organization.schema';
import { AdminAuditLogEntity, AdminAuditLogDocument } from './audit-log.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EventsService } from '../events/events.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';

// ---------------------------------------------------------------------------
// Response DTOs — explicit allowlist, never raw Mongoose documents
// ---------------------------------------------------------------------------

export interface AdminAnalyticsDto {
  totalOrganizations: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalEvents: number;
  liveEvents: number;
  newEventsThisMonth: number;
  totalAIRequests: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
}

export interface AdminUserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'admin' | 'support';
  plan: string;
  isSuspended: boolean;
  organizationId?: string | null;
  organizationName?: string | null;
  createdAt: string;
}

export interface AdminOrganizationSummaryDto {
  id: string;
  name: string;
  plan: string;
  totalUsers: number;
  totalEvents: number;
  createdAt: string;
}

export interface AdminOrganizationListDto {
  data: AdminOrganizationSummaryDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminOrganizationDetailDto extends AdminOrganizationSummaryDto {
  activeEvents: number;
  settings: {
    aiStudioEnabled: boolean;
    advancedAnalyticsEnabled: boolean;
    customBrandingEnabled: boolean;
  };
}

export interface AdminUserListDto {
  data: AdminUserSummaryDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminRecentEventDto {
  id: string;
  name: string;
  eventCode: string;
  status: 'draft' | 'live' | 'ended';
  createdAt: string;
}

export interface AdminIntegrationStatusDto {
  zoom: boolean;
  teams: boolean;
  meet: boolean;
  powerpoint: boolean;
}

export interface AdminUserDetailDto {
  profile: {
    id: string;
    auth0Sub: string;
    name: string;
    email: string;
    role: 'host' | 'admin' | 'support';
    plan: string;
    aiUsageCount: number;
    isSuspended: boolean;
    organizationId?: string | null;
    organizationName?: string | null;
    createdAt: string;
  };
  eventActivity: {
    totalEvents: number;
    liveEvents: number;
    recentEvents: AdminRecentEventDto[];
  };
  integrationStatus: AdminIntegrationStatusDto;
}

export interface AdminIntegrationDetailDto {
  provider: string;
  externalId: string;
  zoomUserId: string | null;
  status: 'Configured' | 'Unknown';
}

export interface AdminUserIntegrationsDto {
  userId: string;
  name: string;
  email: string;
  integrations: AdminIntegrationDetailDto[];
}

export interface AdminIntegrationListDto {
  data: AdminUserIntegrationsDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminEventDiagnosticsDto {
  connectedSockets: number;
  activeActivityId: string | null;
}

export interface AdminAuditLogDto {
  id: string;
  adminId: string;
  adminEmail: string;
  actionType: string;
  targetResourceType: string;
  targetResourceId: string;
  reason: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AdminAuditLogListDto {
  data: AdminAuditLogDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface GetAuditLogsQuery {
  page?: number;
  limit?: number;
  actionType?: string;
  targetResourceType?: string;
  search?: string;
}

export interface AdminEventSummaryDto {
  id: string;
  name: string;
  eventCode: string;
  status: 'draft' | 'live' | 'ended';
  hostId: string;
  hostName: string;
  hostEmail: string;
  createdAt: string;
  scheduledStart: string | null;
}

export interface AdminEventListDto {
  data: AdminEventSummaryDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminEventDetailDto {
  id: string;
  name: string;
  description?: string;
  eventCode: string;
  status: 'draft' | 'live' | 'ended';
  createdAt: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  timezone: string | null;
  settings: {
    allowAnonymousQA: boolean;
    requireModeration: boolean;
    participantNames: boolean;
  };
  host: {
    id: string;
    name: string;
    email: string;
  };
  integrations: Array<{ provider: string; externalId: string }>;
}

// ---------------------------------------------------------------------------
// Query parameter validation
// ---------------------------------------------------------------------------

const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'name', 'email', 'role']);
const ALLOWED_ORDERS = new Set(['asc', 'desc']);
const ALLOWED_ROLES = new Set(['host', 'admin']);
const MAX_LIMIT = 100;

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
  order?: string;
  organizationId?: string;
}

export interface GetEventsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: string;
}

/**
 * Escape a string for safe use in a MongoDB $regex value.
 * Strips all characters that have special meaning in JS/PCRE regex.
 */
function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// AdminService
// ---------------------------------------------------------------------------

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(OrganizationEntity.name)
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectModel(AdminAuditLogEntity.name)
    private readonly auditLogModel: Model<AdminAuditLogDocument>,
    @InjectModel('AiOperationLogEntity')
    private readonly aiOperationLogModel: Model<any>,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly coreEventsService: EventsService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Users List ─────────────────────────────────────────────────────────────

  async getUsers(query: GetUsersQuery): Promise<AdminUserListDto> {
    // Validate + sanitize pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    // Validate sort field against explicit whitelist
    const sort = ALLOWED_SORT_FIELDS.has(query.sort ?? '') ? query.sort! : 'createdAt';
    const order: 1 | -1 = ALLOWED_ORDERS.has(query.order ?? '') && query.order === 'asc' ? 1 : -1;

    // Validate role filter
    const roleFilter =
      query.role && ALLOWED_ROLES.has(query.role) ? query.role : undefined;

    // Build the MongoDB filter
    const filter: Record<string, unknown> = {};

    if (roleFilter) {
      filter.role = roleFilter;
    }

    if (query.status === 'suspended') {
      filter.isSuspended = true;
    } else if (query.status === 'active') {
      filter.isSuspended = false;
    }

    if (query.organizationId && Types.ObjectId.isValid(query.organizationId)) {
      filter.organizationId = new Types.ObjectId(query.organizationId);
    }

    if (query.search) {
      const raw = query.search.trim();
      if (raw) {
        // Attempt exact ObjectId match
        if (Types.ObjectId.isValid(raw) && raw.length === 24) {
          filter._id = new Types.ObjectId(raw);
        }
        // Attempt exact auth0Sub match (format: auth0|<alphanumeric>)
        else if (/^auth0\|.+/.test(raw)) {
          filter.auth0Sub = raw;
        }
        // Case-insensitive escaped regex against name and email
        else {
          const escaped = escapeRegex(raw);
          const regex = { $regex: escaped, $options: 'i' };
          filter.$or = [{ name: regex }, { email: regex }];
        }
      }
    }

    const [docs, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate<{ organizationId: OrganizationDocument }>('organizationId', 'name')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const data: AdminUserSummaryDto[] = docs.map((u) => ({
      id: (u._id as Types.ObjectId).toHexString(),
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      isSuspended: u.isSuspended,
      organizationId: u.organizationId ? (u.organizationId._id as Types.ObjectId).toHexString() : null,
      organizationName: u.organizationId ? u.organizationId.name : null,
      createdAt: (u as any).createdAt?.toISOString?.() ?? '',
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── User Detail ────────────────────────────────────────────────────────────

  async getUserById(id: string): Promise<AdminUserDetailDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const user = await this.userModel.findById(id).populate<{ organizationId: OrganizationDocument }>('organizationId', 'name').lean().exec();
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const userId = (user._id as Types.ObjectId);

    // Event activity — use the existing { hostId, createdAt: -1 } index
    const [totalEvents, liveEvents, recentDocs] = await Promise.all([
      this.eventModel.countDocuments({ hostId: userId }).exec(),
      this.eventModel.countDocuments({ hostId: userId, status: 'live' }).exec(),
      this.eventModel
        .find({ hostId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name eventCode status createdAt')
        .lean()
        .exec(),
    ]);

    const recentEvents: AdminRecentEventDto[] = recentDocs.map((e) => ({
      id: (e._id as Types.ObjectId).toHexString(),
      name: e.name,
      eventCode: e.eventCode,
      status: e.status,
      createdAt: (e as any).createdAt?.toISOString?.() ?? '',
    }));

    // Integration status — safe boolean map only, provider names from existing schema enum:
    // ['zoom', 'teams', 'webex', 'meet', 'powerpoint']
    // We only expose the four user-facing providers
    const connectedProviders = new Set(
      (user.integrations ?? []).map((i) => i.provider),
    );

    const integrationStatus: AdminIntegrationStatusDto = {
      zoom: connectedProviders.has('zoom'),
      teams: connectedProviders.has('teams'),
      meet: connectedProviders.has('meet'),
      powerpoint: connectedProviders.has('powerpoint'),
    };

    return {
      profile: {
        id: userId.toHexString(),
        auth0Sub: user.auth0Sub,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        aiUsageCount: user.aiUsageCount ?? 0,
        isSuspended: user.isSuspended,
        organizationId: user.organizationId ? (user.organizationId._id as Types.ObjectId).toHexString() : null,
        organizationName: user.organizationId ? user.organizationId.name : null,
        createdAt: (user as any).createdAt?.toISOString?.() ?? '',
      },
      eventActivity: {
        totalEvents,
        liveEvents,
        recentEvents,
      },
      integrationStatus,
    };
  }

  // ── Events List ────────────────────────────────────────────────────────────

  async getEvents(query: GetEventsQuery): Promise<AdminEventListDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const sortFields = new Set(['createdAt', 'scheduledStart', 'name', 'status']);
    const sort = sortFields.has(query.sort ?? '') ? query.sort! : 'createdAt';
    const order: 1 | -1 = ALLOWED_ORDERS.has(query.order ?? '') && query.order === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};

    if (query.status && new Set(['draft', 'live', 'ended']).has(query.status)) {
      filter.status = query.status;
    }

    if (query.search) {
      const raw = query.search.trim();
      if (raw) {
        if (Types.ObjectId.isValid(raw) && raw.length === 24) {
          filter.hostId = new Types.ObjectId(raw);
        } else {
          const escaped = escapeRegex(raw);
          const regex = { $regex: escaped, $options: 'i' };
          filter.$or = [
            { name: regex },
            { eventCode: regex }
          ];
        }
      }
    }

    // Aggregation pipeline to join the host details
    const pipeline: any[] = [
      { $match: filter },
      { $sort: { [sort]: order } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'hostId',
          foreignField: '_id',
          as: 'host',
        },
      },
      { $unwind: { path: '$host', preserveNullAndEmptyArrays: true } },
    ];

    const [docs, total] = await Promise.all([
      this.eventModel.aggregate(pipeline).exec(),
      this.eventModel.countDocuments(filter).exec(),
    ]);

    const data: AdminEventSummaryDto[] = docs.map((e: any) => ({
      id: e._id.toHexString(),
      name: e.name,
      eventCode: e.eventCode,
      status: e.status,
      hostId: e.hostId?.toHexString() ?? '',
      hostName: e.host?.name ?? 'Unknown',
      hostEmail: e.host?.email ?? 'Unknown',
      createdAt: e.createdAt?.toISOString() ?? '',
      scheduledStart: e.scheduledStart?.toISOString() ?? null,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Event Detail ───────────────────────────────────────────────────────────

  async getEventById(id: string): Promise<AdminEventDetailDto> {
    let event;

    if (Types.ObjectId.isValid(id) && id.length === 24) {
      event = await this.eventModel
        .findById(id)
        .populate('hostId', 'name email')
        .lean()
        .exec();
    } else if (typeof id === 'string' && id.length === 6) {
      event = await this.eventModel
        .findOne({ eventCode: id.toUpperCase() })
        .populate('hostId', 'name email')
        .lean()
        .exec();
    }

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    const host = event.hostId as unknown as { _id: Types.ObjectId; name: string; email: string };

    return {
      id: (event._id as Types.ObjectId).toHexString(),
      name: event.name,
      description: event.description,
      eventCode: event.eventCode,
      status: event.status,
      createdAt: (event as any).createdAt?.toISOString?.() ?? '',
      scheduledStart: event.scheduledStart?.toISOString() ?? null,
      scheduledEnd: event.scheduledEnd?.toISOString() ?? null,
      timezone: event.timezone ?? null,
      settings: {
        allowAnonymousQA: event.settings?.allowAnonymousQA ?? true,
        requireModeration: event.settings?.requireModeration ?? false,
        participantNames: event.settings?.participantNames ?? false,
      },
      host: {
        id: host?._id?.toHexString() ?? '',
        name: host?.name ?? 'Unknown',
        email: host?.email ?? 'Unknown',
      },
      integrations: event.integrations ?? [],
    };
  }

  // ── Diagnostics & Operations ───────────────────────────────────────────────

  async getEventDiagnostics(id: string): Promise<AdminEventDiagnosticsDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return this.realtimeGateway.getEventDiagnostics(id);
  }

  async forceEndEvent(id: string, admin: AuthenticatedUser, reason?: string, options?: { metadata?: Record<string, any> }): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    const event = await this.eventModel.findById(id).lean();
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    const preTerminationStatus = event.status;
    const preTerminationName = event.name;
    const diagnostics = await this.realtimeGateway.getEventDiagnostics(id);

    // 1. Update the database (sets status to 'ended', endedAt to now)
    await this.coreEventsService.endEvent(id);

    // 2. Broadcast 'session.ended' and disconnect all WebSockets for this event
    await this.realtimeGateway.forceEndEventBroadcast(id);

    this.logger.log(`Admin forcefully ended event ${id}`);

    // 3. Write Audit Log (Fail Open strategy for this specific action)
    await this.createAuditLog(
      {
        adminId: admin.id,
        adminEmail: admin.email,
        actionType: 'FORCE_END_EVENT',
        targetResourceType: 'Event',
        targetResourceId: id,
        reason: reason || null,
        metadata: {
          eventName: preTerminationName,
          previousStatus: preTerminationStatus,
          connectedSocketsDisconnected: diagnostics.connectedSockets,
          ...(options?.metadata || {}),
        },
      },
      true // failOpen = true
    );
  }

  // ── Integration Diagnostics ────────────────────────────────────────────────

  async getIntegrationDiagnostics(query: GetUsersQuery): Promise<AdminIntegrationListDto> {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      // Only return users who actually have at least one integration
      'integrations.0': { $exists: true }
    };

    if (search) {
      const raw = search.trim();
      if (raw) {
        if (Types.ObjectId.isValid(raw) && raw.length === 24) {
          filter._id = new Types.ObjectId(raw);
        } else {
          const escaped = escapeRegex(raw);
          const regex = { $regex: escaped, $options: 'i' };
          filter.$or = [
            { email: regex },
            { name: regex },
            { 'integrations.externalId': regex },
            { 'integrations.zoomUserId': regex }
          ];
        }
      }
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const data = users.map((u) => ({
      userId: u._id.toHexString(),
      name: u.name,
      email: u.email,
      integrations: u.integrations.map((i) => ({
        provider: i.provider,
        externalId: i.externalId,
        zoomUserId: i.zoomUserId || null,
        status: (i.refreshToken ? 'Configured' : 'Unknown') as 'Configured' | 'Unknown',
      })),
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  async createAuditLog(
    data: {
      adminId: string;
      adminEmail: string;
      actionType: string;
      targetResourceType: string;
      targetResourceId: string;
      reason: string | null;
      metadata: Record<string, any>;
    },
    failOpen: boolean = false
  ): Promise<void> {
    try {
      await this.auditLogModel.create(data);
    } catch (err) {
      this.logger.error(
        `[CRITICAL] Failed to write audit log for ${data.actionType} by ${data.adminId} on ${data.targetResourceType} ${data.targetResourceId}`,
        err
      );
      if (!failOpen) {
        throw new BadRequestException('Action succeeded, but failed to write audit log.');
      }
    }
  }

  async getAuditLogs(query: GetAuditLogsQuery): Promise<AdminAuditLogListDto> {
    const { page = 1, limit = 50, actionType, targetResourceType, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (actionType) {
      filter.actionType = actionType;
    }
    
    if (targetResourceType) {
      filter.targetResourceType = targetResourceType;
    }

    if (search) {
      const raw = search.trim();
      if (raw) {
        if (Types.ObjectId.isValid(raw) && raw.length === 24) {
          filter.$or = [
            { targetResourceId: raw },
            { adminId: raw }
          ];
        } else {
          const escaped = escapeRegex(raw);
          const regex = { $regex: escaped, $options: 'i' };
          filter.$or = [
            { adminEmail: regex },
            { targetResourceId: regex }
          ];
        }
      }
    }

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    const data = logs.map((log: any) => ({
      id: log._id.toHexString(),
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      actionType: log.actionType,
      targetResourceType: log.targetResourceType,
      targetResourceId: log.targetResourceId,
      reason: log.reason || null,
      metadata: log.metadata || {},
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Organizations ──────────────────────────────────────────────────────────

  async getOrganizations(query: { page?: number; limit?: number; search?: string }): Promise<AdminOrganizationListDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.name = { $regex: escapeRegex(query.search.trim()), $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      this.organizationModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
      this.organizationModel.countDocuments(filter).exec(),
    ]);

    const data: AdminOrganizationSummaryDto[] = await Promise.all(docs.map(async (o) => {
      const orgId = o._id as Types.ObjectId;
      const [totalUsers, totalEvents] = await Promise.all([
        this.userModel.countDocuments({ organizationId: orgId }).exec(),
        this.eventModel.countDocuments({ organizationId: orgId }).exec()
      ]);
      return {
        id: orgId.toHexString(),
        name: o.name,
        plan: o.plan,
        totalUsers,
        totalEvents,
        createdAt: (o as any).createdAt?.toISOString?.() ?? '',
      };
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrganizationById(id: string): Promise<AdminOrganizationDetailDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    const org = await this.organizationModel.findById(id).lean().exec();
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    const orgId = org._id as Types.ObjectId;
    const [totalUsers, totalEvents, activeEvents] = await Promise.all([
      this.userModel.countDocuments({ organizationId: orgId }).exec(),
      this.eventModel.countDocuments({ organizationId: orgId }).exec(),
      this.eventModel.countDocuments({ organizationId: orgId, status: 'live' }).exec()
    ]);

    return {
      id: orgId.toHexString(),
      name: org.name,
      plan: org.plan,
      totalUsers,
      totalEvents,
      activeEvents,
      settings: {
        aiStudioEnabled: org.settings?.aiStudioEnabled ?? false,
        advancedAnalyticsEnabled: org.settings?.advancedAnalyticsEnabled ?? false,
        customBrandingEnabled: org.settings?.customBrandingEnabled ?? false,
      },
      createdAt: (org as any).createdAt?.toISOString?.() ?? '',
    };
  }

  async createOrganization(admin: AuthenticatedUser, data: { name: string; plan?: string }): Promise<AdminOrganizationSummaryDto> {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Organization name is required');
    }

    const created = await this.organizationModel.create({
      name: data.name.trim(),
      plan: data.plan?.trim() || 'free',
      settings: {}
    });

    const orgId = created._id as Types.ObjectId;

    await this.auditLogModel.create({
      adminId: admin.id,
      adminEmail: admin.email,
      actionType: 'ORGANIZATION_CREATED',
      targetResourceType: 'Organization',
      targetResourceId: orgId.toHexString(),
      metadata: { name: created.name, plan: created.plan },
    });

    return {
      id: orgId.toHexString(),
      name: created.name,
      plan: created.plan,
      totalUsers: 0,
      totalEvents: 0,
      createdAt: (created as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }

  async assignUserToOrganization(admin: AuthenticatedUser, orgId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(orgId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid Organization ID or User ID');
    }

    const org = await this.organizationModel.exists({ _id: orgId });
    if (!org) {
      throw new NotFoundException(`Organization ${orgId} not found`);
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { organizationId: new Types.ObjectId(orgId) } }
    ).exec();

    await this.auditLogModel.create({
      adminId: admin.id,
      adminEmail: admin.email,
      actionType: 'USER_ASSIGNED_TO_ORGANIZATION',
      targetResourceType: 'Organization',
      targetResourceId: orgId,
      metadata: { userId },
    });
  }

  async unassignUserFromOrganization(admin: AuthenticatedUser, orgId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(orgId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid Organization ID or User ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user || !user.organizationId || user.organizationId.toHexString() !== orgId) {
      throw new NotFoundException(`User ${userId} is not assigned to this organization`);
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $unset: { organizationId: 1 } }
    ).exec();

    await this.auditLogModel.create({
      adminId: admin.id,
      adminEmail: admin.email,
      actionType: 'USER_UNASSIGNED_FROM_ORGANIZATION',
      targetResourceType: 'Organization',
      targetResourceId: orgId,
      metadata: { userId },
    });
  }

  async getAnalytics(): Promise<AdminAnalyticsDto> {
    const now = new Date();
    const rolling24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const rolling30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrganizations,
      totalUsers,
      newUsersThisMonth,
      totalEvents,
      liveEvents,
      newEventsThisMonth,
      aiStats,
      dailyActiveUsers,
      monthlyActiveUsers,
    ] = await Promise.all([
      this.organizationModel.countDocuments(),
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ createdAt: { $gte: rolling30Days } }),
      this.eventModel.countDocuments(),
      this.eventModel.countDocuments({ status: 'live' }),
      this.eventModel.countDocuments({ createdAt: { $gte: rolling30Days } }),
      this.userModel.aggregate([
        { $group: { _id: null, totalAIRequests: { $sum: '$aiUsageCount' } } }
      ]),
      this.userModel.countDocuments({ lastActiveAt: { $gte: rolling24Hours } }),
      this.userModel.countDocuments({ lastActiveAt: { $gte: rolling30Days } })
    ]);

    const totalAIRequests = aiStats.length > 0 ? aiStats[0].totalAIRequests : 0;

    return {
      totalOrganizations,
      totalUsers,
      newUsersThisMonth,
      totalEvents,
      liveEvents,
      newEventsThisMonth,
      totalAIRequests,
      dailyActiveUsers,
      monthlyActiveUsers,
    };
  }

  // ── Impersonation ──────────────────────────────────────────────────────────

  private handoffCodes = new Map<string, { token: string, expiresAt: number }>();

  async createImpersonationToken(admin: AuthenticatedUser, userId: string, reason: string): Promise<{ handoffCode: string }> {
    if (!reason || reason.trim().length < 10 || reason.length > 200) {
      throw new BadRequestException('A valid reason between 10 and 200 characters is required');
    }

    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin' || user.role === 'support') {
      await this.auditLogModel.create({
        adminId: admin.id,
        adminEmail: admin.email,
        actionType: 'IMPERSONATION_FAILED',
        targetResourceType: 'User',
        targetResourceId: user._id.toString(),
        reason: 'Attempted to impersonate an admin or support user',
        metadata: {},
      });
      throw new BadRequestException('Cannot impersonate an admin or support user.');
    }

    const payload = {
      sub: user._id.toString(),
      auth0Sub: user.auth0Sub,
      name: user.name,
      email: user.email,
      role: 'host',
      organizationId: user.organizationId?.toString(),
      isImpersonating: true,
      impersonatorId: admin.id,
      impersonatorEmail: admin.email,
    };

    const token = this.jwtService.sign(payload);
    
    const handoffCode = randomUUID();
    
    this.handoffCodes.set(handoffCode, {
      token,
      expiresAt: Date.now() + 60 * 1000,
    });

    await this.auditLogModel.create({
      adminId: admin.id,
      adminEmail: admin.email,
      actionType: 'ADMIN_STARTED_IMPERSONATION',
      targetResourceType: 'User',
      targetResourceId: user._id.toString(),
      reason: reason.trim(),
      metadata: {},
    });

    return { handoffCode };
  }

  async exchangeHandoffCode(code: string): Promise<{ token: string }> {
    const entry = this.handoffCodes.get(code);
    if (!entry) {
      throw new BadRequestException('Invalid or expired handoff code');
    }
    
    this.handoffCodes.delete(code); // single-use
    
    if (Date.now() > entry.expiresAt) {
      throw new BadRequestException('Handoff code expired');
    }
    
    return { token: entry.token };
  }

  async logImpersonationStopped(user: AuthenticatedUser): Promise<{ success: boolean }> {
    await this.auditLogModel.create({
      adminId: user.impersonatorId,
      adminEmail: user.impersonatorEmail || 'unknown@impersonator.com',
      actionType: 'ADMIN_STOPPED_IMPERSONATION',
      targetResourceType: 'User',
      targetResourceId: user.id,
      reason: null,
      metadata: {},
    });
    return { success: true };
  }

  async suspendUser(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    reason: string,
    options?: { metadata?: Record<string, any> }
  ): Promise<{ success: boolean }> {
    if (!reason?.trim()) {
      throw new BadRequestException('Suspension requires a reason.');
    }
    if (adminId === targetUserId) {
      throw new BadRequestException('You cannot suspend your own account.');
    }
    const user = await this.userModel.findById(targetUserId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'admin' || user.role === 'support') {
      throw new BadRequestException('Cannot suspend a privileged account.');
    }

    user.isSuspended = true;
    await user.save();

    await this.auditLogModel.create({
      adminId,
      adminEmail,
      actionType: 'USER_SUSPENDED',
      targetResourceType: 'User',
      targetResourceId: user._id.toString(),
      reason: reason.trim(),
      metadata: options?.metadata || {},
    });

    return { success: true };
  }

  async reactivateUser(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    reason: string,
    options?: { metadata?: Record<string, any> }
  ): Promise<{ success: boolean }> {
    if (!reason?.trim()) {
      throw new BadRequestException('Reactivation requires a reason.');
    }
    const user = await this.userModel.findById(targetUserId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isSuspended = false;
    await user.save();

    await this.auditLogModel.create({
      adminId,
      adminEmail,
      actionType: 'USER_REACTIVATED',
      targetResourceType: 'User',
      targetResourceId: user._id.toString(),
      reason: reason.trim(),
      metadata: options?.metadata || {},
    });

    return { success: true };
  }

  async getAiOperationsTelemetry(): Promise<any> {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] },
          },
          throttledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'throttled'] }, 1, 0] },
          },
          totalTokens: { $sum: '$totalTokens' },
          avgLatencyMs: { $avg: '$latencyMs' },
        },
      },
    ];

    const featurePipeline: any[] = [
      {
        $group: {
          _id: '$featureName',
          count: { $sum: 1 },
          avgLatencyMs: { $avg: '$latencyMs' },
          totalTokens: { $sum: '$totalTokens' },
        },
      },
      { $sort: { count: -1 } },
    ];

    const [summaryResult, featuresResult] = await Promise.all([
      this.aiOperationLogModel.aggregate(pipeline).exec(),
      this.aiOperationLogModel.aggregate(featurePipeline).exec(),
    ]);

    const summary = summaryResult[0] || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      throttledRequests: 0,
      totalTokens: 0,
      avgLatencyMs: 0,
    };

    return {
      summary,
      features: featuresResult.map((f: any) => ({
        featureName: f._id,
        count: f.count,
        avgLatencyMs: f.avgLatencyMs || 0,
        totalTokens: f.totalTokens || 0,
      })),
    };
  }
}
