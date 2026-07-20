/**
 * Admin API client — typed fetch wrapper.
 *
 * All requests go through the Next.js /api/proxy route (server-side),
 * which attaches the Auth0 Bearer token before forwarding to NestJS.
 * The browser never makes cross-origin requests directly to the API.
 *
 * Future phases will add typed functions for users, events, audit logs, etc.
 */

const PROXY_BASE = '/api/proxy';

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, '');
  const res = await fetch(`${PROXY_BASE}/${normalizedPath}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      // keep default message
    }
    throw new AdminApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Phase 1: Identity & Stats
// ---------------------------------------------------------------------------

export interface AdminMe {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'admin';
}

export interface AdminStats {
  totalEvents: number;
  liveEvents: number;
  totalHosts: number;
}

/** Client-side fetch: verify admin identity and RBAC via the proxy. */
export async function fetchAdminMe(): Promise<AdminMe> {
  return adminFetch<AdminMe>('admin/me');
}

/** Server-side fetch: call NestJS directly from a Server Component. */
export async function fetchAdminMeServer(): Promise<AdminMe> {
  const { getAccessToken } = await import('@auth0/nextjs-auth0');
  let accessToken: string | undefined;

  try {
    ({ accessToken } = await getAccessToken());
  } catch (err) {
    throw new AdminApiError('No access token', 401);
  }

  const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const res = await fetch(`${API_URL}/admin/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new AdminApiError(`Server fetch failed (${res.status})`, res.status);
  }

  return res.json();
}

/** Platform-wide statistics for the Workspace Launcher header. */
export async function fetchAdminStats(): Promise<AdminStats> {
  return adminFetch<AdminStats>('admin/stats');
}

// ---------------------------------------------------------------------------
// Phase 2: Users & Hosts
// ---------------------------------------------------------------------------

export interface AdminUserSummary {
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

export interface AdminUserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  data: AdminUserSummary[];
  meta: AdminUserListMeta;
}

export interface AdminRecentEvent {
  id: string;
  name: string;
  eventCode: string;
  status: 'draft' | 'live' | 'ended';
  createdAt: string;
}

export interface AdminIntegrationStatus {
  zoom: boolean;
  teams: boolean;
  meet: boolean;
  powerpoint: boolean;
}

export interface AdminUserDetail {
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
    recentEvents: AdminRecentEvent[];
  };
  integrationStatus: AdminIntegrationStatus;
}

export interface UserSearchParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  organizationId?: string;
}

/** Paginated global user search — all params validated server-side. */
export async function fetchAdminUsers(
  params: UserSearchParams = {},
): Promise<AdminUserListResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.role) qs.set('role', params.role);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.sort) qs.set('sort', params.sort);
  if (params.order) qs.set('order', params.order);
  if (params.organizationId) qs.set('organizationId', params.organizationId);
  const query = qs.toString();
  return adminFetch<AdminUserListResponse>(`admin/users${query ? `?${query}` : ''}`);
}

/** Fetch a single user's full detail view. */
export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  return adminFetch<AdminUserDetail>(`admin/users/${encodeURIComponent(id)}`);
}

// ---------------------------------------------------------------------------
// Phase 3: Events
// ---------------------------------------------------------------------------

export interface AdminEventSummary {
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

export interface AdminEventListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminEventListResponse {
  data: AdminEventSummary[];
  meta: AdminEventListMeta;
}

export interface AdminEventDetail {
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

export interface EventSearchParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}

/** Paginated global event search. */
export async function fetchAdminEvents(
  params: EventSearchParams = {},
): Promise<AdminEventListResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.sort) qs.set('sort', params.sort);
  if (params.order) qs.set('order', params.order);
  const query = qs.toString();
  return adminFetch<AdminEventListResponse>(`admin/events${query ? `?${query}` : ''}`);
}

/** Fetch a single event's full detail view. */
export async function fetchAdminEvent(id: string): Promise<AdminEventDetail> {
  return adminFetch<AdminEventDetail>(`admin/events/${encodeURIComponent(id)}`);
}

// ---------------------------------------------------------------------------
// Phase 4: Live Event Operations
// ---------------------------------------------------------------------------

export interface AdminEventDiagnostics {
  connectedSockets: number;
  activeActivityId: string | null;
}

/** Fetch real-time diagnostics for a live event via the WebSockets gateway. */
export async function fetchEventDiagnostics(id: string): Promise<AdminEventDiagnostics> {
  return adminFetch<AdminEventDiagnostics>(`admin/events/${encodeURIComponent(id)}/diagnostics`);
}

/** Forcibly ends a live event, disconnecting all participants immediately. */
export async function forceEndAdminEvent(id: string, reason?: string): Promise<void> {
  return adminFetch<void>(`admin/events/${encodeURIComponent(id)}/end`, {
    method: 'POST',
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
}

// ---------------------------------------------------------------------------
// Phase 5: Integration Diagnostics
// ---------------------------------------------------------------------------

export interface AdminIntegrationDetail {
  provider: string;
  externalId: string;
  zoomUserId: string | null;
  status: 'Configured' | 'Unknown';
}

export interface AdminUserIntegrations {
  userId: string;
  name: string;
  email: string;
  integrations: AdminIntegrationDetail[];
}

export interface AdminIntegrationList {
  data: AdminUserIntegrations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IntegrationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** Fetch integration diagnostics, supports searching by email, name, or external IDs. */
export async function fetchAdminIntegrations(
  params: IntegrationSearchParams = {}
): Promise<AdminIntegrationList> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', params.page.toString());
  if (params.limit) q.set('limit', params.limit.toString());
  if (params.search) q.set('search', params.search);

  return adminFetch<AdminIntegrationList>(`admin/integrations?${q.toString()}`);
}

// ---------------------------------------------------------------------------
// Phase 6: Audit Logs
// ---------------------------------------------------------------------------

export interface AuditLogRecord {
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

export interface AuditLogList {
  data: AuditLogRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogSearchParams {
  page?: number;
  limit?: number;
  actionType?: string;
  targetResourceType?: string;
  search?: string;
}

/** Fetch admin audit logs. */
export async function fetchAuditLogs(
  params: AuditLogSearchParams = {}
): Promise<AuditLogList> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', params.page.toString());
  if (params.limit) q.set('limit', params.limit.toString());
  if (params.actionType) q.set('actionType', params.actionType);
  if (params.targetResourceType) q.set('targetResourceType', params.targetResourceType);
  if (params.search) q.set('search', params.search);

  return adminFetch<AuditLogList>(`admin/audit-logs?${q.toString()}`);
}

// ---------------------------------------------------------------------------
// Phase 9: Platform Analytics & System Health
// ---------------------------------------------------------------------------

export interface AdminAnalytics {
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

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  return adminFetch<AdminAnalytics>('admin/analytics');
}

export interface SystemHealth {
  status: 'ok' | 'error' | 'shutting_down';
  info: Record<string, { status: string; [key: string]: any }>;
  error: Record<string, { status: string; [key: string]: any }>;
  details: Record<string, { status: string; [key: string]: any }>;
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  return adminFetch<SystemHealth>('health');
}

// ---------------------------------------------------------------------------
// Phase 8: Organizations / Multi-tenancy
// ---------------------------------------------------------------------------

export interface AdminOrganizationSummary {
  id: string;
  name: string;
  plan: string;
  totalUsers: number;
  totalEvents: number;
  createdAt: string;
}

export interface AdminOrganizationListResponse {
  data: AdminOrganizationSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminOrganizationDetail extends AdminOrganizationSummary {
  activeEvents: number;
  settings: {
    aiStudioEnabled: boolean;
    advancedAnalyticsEnabled: boolean;
    customBrandingEnabled: boolean;
  };
}

export async function fetchAdminOrganizations(params: { page?: number; limit?: number; search?: string } = {}): Promise<AdminOrganizationListResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return adminFetch<AdminOrganizationListResponse>(`admin/organizations${query ? `?${query}` : ''}`);
}

export async function fetchAdminOrganizationById(id: string): Promise<AdminOrganizationDetail> {
  return adminFetch<AdminOrganizationDetail>(`admin/organizations/${encodeURIComponent(id)}`);
}

export async function createAdminOrganization(data: { name: string; plan?: string }): Promise<AdminOrganizationSummary> {
  return adminFetch<AdminOrganizationSummary>('admin/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function assignAdminUserToOrg(orgId: string, userId: string): Promise<void> {
  return adminFetch<void>(`admin/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
  });
}

export async function unassignAdminUserFromOrg(orgId: string, userId: string): Promise<void> {
  return adminFetch<void>(`admin/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

// ── FEATURE FLAGS ─────────────────────────────────────────────────────────────

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  isGlobalEnabled: boolean;
  organizationOverrides: Record<string, boolean>;
}

export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  return adminFetch<FeatureFlag[]>('admin/feature-flags');
}

export async function createFeatureFlag(payload: { key: string, name: string, description: string, isGlobalEnabled: boolean }): Promise<FeatureFlag> {
  return adminFetch<FeatureFlag>('admin/feature-flags', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateFeatureFlag(key: string, payload: { name?: string, description?: string, isGlobalEnabled?: boolean }): Promise<FeatureFlag> {
  return adminFetch<FeatureFlag>(`admin/feature-flags/${encodeURIComponent(key)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function setFeatureFlagOverride(key: string, orgId: string, isEnabled: boolean): Promise<any> {
  return adminFetch<any>(`admin/feature-flags/${encodeURIComponent(key)}/overrides/${encodeURIComponent(orgId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ isEnabled })
  });
}

export async function deleteFeatureFlagOverride(key: string, orgId: string): Promise<any> {
  return adminFetch<any>(`admin/feature-flags/${encodeURIComponent(key)}/overrides/${encodeURIComponent(orgId)}`, {
    method: 'DELETE'
  });
}

export async function deleteFeatureFlag(key: string): Promise<void> {
  return adminFetch<void>(`admin/feature-flags/${encodeURIComponent(key)}`, {
    method: 'DELETE'
  });
}

// ── USER MANAGEMENT MUTATIONS ────────────────────────────────────────────────

export async function suspendUser(id: string, reason: string): Promise<{ success: boolean }> {
  return adminFetch<{ success: boolean }>(`admin/users/${encodeURIComponent(id)}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function reactivateUser(id: string, reason: string): Promise<{ success: boolean }> {
  return adminFetch<{ success: boolean }>(`admin/users/${encodeURIComponent(id)}/reactivate`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

// ── AI OPERATIONS ────────────────────────────────────────────────────────────

export interface AiOperationsTelemetry {
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    throttledRequests: number;
    totalTokens: number;
    avgLatencyMs: number;
  };
  features: Array<{
    featureName: string;
    count: number;
    avgLatencyMs: number;
    totalTokens: number;
  }>;
}

export async function fetchAiOperationsTelemetry(): Promise<AiOperationsTelemetry> {
  return adminFetch<AiOperationsTelemetry>('admin/ai-operations');
}
