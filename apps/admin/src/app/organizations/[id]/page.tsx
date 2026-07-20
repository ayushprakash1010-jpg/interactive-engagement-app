'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Building,
  Users,
  TriangleAlert,
  Loader2,
  CalendarDays,
  Settings,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminApiError, fetchAdminOrganizationById, fetchAdminUsers, assignAdminUserToOrg, unassignAdminUserFromOrg } from '@/lib/admin-api';
import type { AdminOrganizationDetail, AdminUserSummary } from '@/lib/admin-api';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function roleBadge(role: 'host' | 'admin' | 'support') {
  if (role === 'admin') return <Badge variant="brand">Admin</Badge>;
  if (role === 'support') return <Badge variant="warning">Support</Badge>;
  return <Badge variant="neutral">Host</Badge>;
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params.id as string;
  const router = useRouter();

  const [org, setOrg] = React.useState<AdminOrganizationDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [users, setUsers] = React.useState<AdminUserSummary[]>([]);
  const [meta, setMeta] = React.useState<any>(null);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);

  const [isAssigning, setIsAssigning] = React.useState(false);
  const [assignUserId, setAssignUserId] = React.useState('');
  const [assignLoading, setAssignLoading] = React.useState(false);

  const loadOrg = React.useCallback(async (cancelled = false) => {
    setLoading(true);
    try {
      const res = await fetchAdminOrganizationById(orgId);
      if (!cancelled) setOrg(res);
    } catch (err) {
      if (!cancelled) {
        if (err instanceof AdminApiError && err.status === 401) {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [orgId, router]);

  React.useEffect(() => {
    let cancelled = false;
    loadOrg(cancelled);
    return () => { cancelled = true; };
  }, [loadOrg]);

  const loadUsers = React.useCallback(async (cancelled = false) => {
    setUsersLoading(true);
    try {
      const res = await fetchAdminUsers({ organizationId: orgId, page, limit: 10 });
      if (!cancelled) {
        setUsers(res.data);
        setMeta(res.meta);
      }
    } catch (err) {} finally {
      if (!cancelled) setUsersLoading(false);
    }
  }, [orgId, page]);

  React.useEffect(() => {
    let cancelled = false;
    loadUsers(cancelled);
    return () => { cancelled = true; };
  }, [loadUsers]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId.trim()) return;
    setAssignLoading(true);
    try {
      await assignAdminUserToOrg(orgId, assignUserId.trim());
      setIsAssigning(false);
      setAssignUserId('');
      await loadOrg();
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to assign user');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassign = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to unassign this user?')) return;
    try {
      await unassignAdminUserFromOrg(orgId, userId);
      await loadOrg();
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unassign user');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-canvas">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas">
        <TriangleAlert className="mb-4 h-12 w-12 text-destructive opacity-50" />
        <h2 className="text-lg font-semibold text-foreground">Failed to load organization</h2>
        <p className="text-sm text-ink-secondary mb-6">{error}</p>
        <Link href="/organizations" className="text-sm text-brand hover:underline">
          &larr; Back to organizations
        </Link>
      </div>
    );
  }

  const hasPrev = (meta?.page ?? 1) > 1;
  const hasNext = meta ? meta.page < meta.totalPages : false;

  return (
    <div className="min-h-screen bg-surface-canvas pb-20">
      <div className="border-b bg-surface-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/organizations"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Organizations
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Organization Profile
                </p>
                <Badge variant="neutral" size="sm" className="capitalize">{org.plan} Plan</Badge>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building className="h-6 w-6 text-brand" /> {org.name}
              </h1>
              <p className="mt-1 text-sm text-ink-secondary font-mono text-xs">
                ID: {org.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-muted uppercase font-semibold mb-1">Created</p>
              <p className="text-sm font-medium">{formatDate(org.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-sunken">
              <Users className="h-5 w-5 text-ink-muted" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Total Users</p>
            <p className="font-display text-3xl font-bold text-foreground">{org.totalUsers.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-sunken">
              <CalendarDays className="h-5 w-5 text-ink-muted" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Total Events</p>
            <p className="font-display text-3xl font-bold text-foreground">{org.totalEvents.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-live/10">
              <Radio className="h-5 w-5 text-live" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Live Events</p>
            <p className="font-display text-3xl font-bold text-foreground">{org.activeEvents ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-sunken">
              <Settings className="h-5 w-5 text-ink-muted" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Settings</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">AI Studio</span>
                {org.settings.aiStudioEnabled ? <Badge variant="brand" size="sm">Enabled</Badge> : <Badge variant="neutral" size="sm">Disabled</Badge>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">Advanced Analytics</span>
                {org.settings.advancedAnalyticsEnabled ? <Badge variant="brand" size="sm">Enabled</Badge> : <Badge variant="neutral" size="sm">Disabled</Badge>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">Custom Branding</span>
                {org.settings.customBrandingEnabled ? <Badge variant="brand" size="sm">Enabled</Badge> : <Badge variant="neutral" size="sm">Disabled</Badge>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-lg font-semibold">Affiliated Users</h2>
          <button
            onClick={() => setIsAssigning(!isAssigning)}
            className="text-sm font-medium text-brand hover:underline"
          >
            {isAssigning ? 'Cancel' : 'Assign Users'}
          </button>
        </div>

        {isAssigning && (
          <div className="rounded-xl border bg-surface-card p-6 shadow-sm mb-6">
            <h3 className="text-sm font-semibold mb-2">Assign User by ID</h3>
            <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  required
                  value={assignUserId}
                  onChange={e => setAssignUserId(e.target.value)}
                  className="w-full rounded-md border bg-surface-sunken px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="User ID (e.g. 64b3...)"
                />
              </div>
              <button
                type="submit"
                disabled={assignLoading || !assignUserId.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
              </button>
            </form>
          </div>
        )}

        <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!usersLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                      No affiliated users found.
                    </td>
                  </tr>
                )}
                {!usersLoading && users.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-surface-raised transition-colors cursor-pointer"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground group-hover:text-brand transition-colors">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3 capitalize text-ink-secondary">{user.plan}</td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => handleUnassign(e, user.id)}
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-ink-muted">
              <span>Page {meta.page} of {meta.totalPages} &middot; {meta.total} users</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev || usersLoading}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-md border', hasPrev && !usersLoading ? 'hover:bg-surface-raised text-foreground' : 'cursor-not-allowed opacity-40')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || usersLoading}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-md border', hasNext && !usersLoading ? 'hover:bg-surface-raised text-foreground' : 'cursor-not-allowed opacity-40')}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
