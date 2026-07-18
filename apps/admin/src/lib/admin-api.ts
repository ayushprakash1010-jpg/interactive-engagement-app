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

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
