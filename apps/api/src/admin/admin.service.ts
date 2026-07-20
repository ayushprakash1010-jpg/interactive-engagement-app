import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity, UserDocument } from '../users/user.schema';
import { EventEntity, EventDocument } from '../events/event.schema';
import { AdminAuditLogEntity, AdminAuditLogDocument } from './audit-log.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EventsService } from '../events/events.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

// ---------------------------------------------------------------------------
// Response DTOs — explicit allowlist, never raw Mongoose documents
// ---------------------------------------------------------------------------

export interface AdminUserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'admin';
  plan: string;
  createdAt: string;
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
    role: 'host' | 'admin';
    plan: string;
    aiUsageCount: number;
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
  role?: string;
  sort?: string;
  order?: string;
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
    @InjectModel(AdminAuditLogEntity.name)
    private readonly auditLogModel: Model<AdminAuditLogDocument>,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly coreEventsService: EventsService,
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

    const user = await this.userModel.findById(id).lean().exec();
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
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    const event = await this.eventModel
      .findById(id)
      .populate('hostId', 'name email')
      .lean()
      .exec();

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

  async forceEndEvent(id: string, admin: AuthenticatedUser, reason?: string): Promise<void> {
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

  private async createAuditLog(
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
}
