'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  User,
  CalendarDays,
  Zap,
  Puzzle,
  Bot,
  TriangleAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AdminApiError, fetchAdminUser } from '@/lib/admin-api';
import type { AdminUserDetail, AdminRecentEvent } from '@/lib/admin-api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function roleBadge(role: 'host' | 'admin') {
  return role === 'admin' ? (
    <Badge variant="brand">Admin</Badge>
  ) : (
    <Badge variant="neutral">Host</Badge>
  );
}

function eventStatusBadge(status: 'draft' | 'live' | 'ended') {
  if (status === 'live') return <Badge variant="live" dot>Live</Badge>;
  if (status === 'ended') return <Badge variant="neutral">Ended</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

function SectionCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle text-brand">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integration status row
// ---------------------------------------------------------------------------

function IntegrationRow({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-ink-secondary">{label}</span>
      {connected ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <XCircle className="h-3.5 w-3.5" />
          Not connected
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent event row
// ---------------------------------------------------------------------------

function RecentEventRow({ event }: { event: AdminRecentEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="group flex items-center justify-between gap-4 py-3 text-sm border-b last:border-0 hover:bg-surface-sunken/30 px-2 -mx-2 rounded transition-colors">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground group-hover:text-brand transition-colors">{event.name}</p>
        <p className="text-xs text-ink-muted font-mono">{event.eventCode}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {eventStatusBadge(event.status)}
        <span className="text-xs text-ink-muted">{formatDate(event.createdAt)}</span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-surface-sunken" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface-card p-5 space-y-3">
            <div className="h-5 w-32 rounded bg-surface-sunken" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-4 w-full rounded bg-surface-sunken" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [user, setUser] = React.useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchAdminUser(id)
      .then(setUser)
      .catch((err) => {
        if (err instanceof AdminApiError) {
          if (err.status === 401) { router.push('/login'); return; }
          if (err.status === 403) { router.push('/access-denied'); return; }
          if (err.status === 404) { setNotFound(true); return; }
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  return (
    <div className="min-h-screen bg-surface-canvas">
      {/* Page header */}
      <div className="border-b bg-surface-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/home' },
              { label: 'Global Support Search', href: '/support' },
              { label: user ? user.profile.name : 'User Profile' }
            ]} 
            className="mb-4"
          />

          {loading && (
            <div className="h-8 w-64 rounded bg-surface-sunken animate-pulse" />
          )}
          {!loading && user && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {user.profile.name}
                </h1>
                {roleBadge(user.profile.role)}
              </div>
              <Link 
                href={`/audit-logs?resource=${user.profile.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Audit History
              </Link>
            </div>
          )}
          {!loading && notFound && (
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              User Not Found
            </h1>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading user…
          </div>
        )}

        {/* Not Found */}
        {!loading && notFound && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-muted">
            <TriangleAlert className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">User not found</p>
            <p className="text-xs">
              The ID <code className="font-mono text-2xs bg-surface-sunken px-1 py-0.5 rounded">{id}</code> does not match any user.
            </p>
            <Link href="/users" className="mt-2 text-xs font-medium text-brand hover:underline">
              Back to search
            </Link>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
            <TriangleAlert className="h-10 w-10 opacity-50" />
            <p className="text-sm font-medium">Failed to load user</p>
            <p className="text-xs text-ink-muted">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && user && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column — Profile + AI */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile */}
              <SectionCard icon={User} title="Profile">
                <dl className="space-y-3 text-sm divide-y divide-border">
                  <ProfileRow label="Email" value={user.profile.email} />
                  <ProfileRow label="Role" value={roleBadge(user.profile.role)} />
                  <ProfileRow label="Plan" value={<span className="capitalize">{user.profile.plan}</span>} />
                  <ProfileRow label="Joined" value={formatDate(user.profile.createdAt)} />
                  <ProfileRow
                    label="Auth0 ID"
                    value={
                      <span className="font-mono text-2xs break-all text-ink-muted">
                        {user.profile.auth0Sub}
                      </span>
                    }
                  />
                  <ProfileRow
                    label="User ID"
                    value={
                      <span className="font-mono text-2xs break-all text-ink-muted">
                        {user.profile.id}
                      </span>
                    }
                  />
                </dl>
              </SectionCard>

              {/* AI Usage */}
              <SectionCard icon={Bot} title="AI Usage">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary">AI generations used</span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {user.profile.aiUsageCount.toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  Lifetime AI activity requests by this user.
                </p>
              </SectionCard>
            </div>

            {/* Right column — Events + Integrations */}
            <div className="space-y-6 lg:col-span-2">
              {/* Event Activity */}
              <SectionCard icon={CalendarDays} title="Event Activity">
                {/* Summary metrics */}
                <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <MetricTile label="Total Events" value={user.eventActivity.totalEvents} />
                  <MetricTile label="Live Now" value={user.eventActivity.liveEvents} live={user.eventActivity.liveEvents > 0} />
                </div>

                {/* Recent events */}
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Recent Events
                </h3>
                {user.eventActivity.recentEvents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-muted">No events yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {user.eventActivity.recentEvents.map((e) => (
                      <RecentEventRow key={e.id} event={e} />
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-ink-muted">
                  Showing up to 5 most recent events. Full event diagnostics available in Phase 3.
                </p>
              </SectionCard>

              {/* Integrations */}
              <SectionCard 
                icon={Puzzle} 
                title="Integrations"
                action={
                  <Link 
                    href={`/integrations?q=${encodeURIComponent(user.profile.email)}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                  >
                    Diagnostics <ExternalLink className="h-3 w-3" />
                  </Link>
                }
              >
                <div className="divide-y divide-border">
                  <IntegrationRow label="Zoom" connected={user.integrationStatus.zoom} />
                  <IntegrationRow label="Microsoft Teams" connected={user.integrationStatus.teams} />
                  <IntegrationRow label="Google Meet" connected={user.integrationStatus.meet} />
                  <IntegrationRow label="PowerPoint" connected={user.integrationStatus.powerpoint} />
                </div>
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small local components
// ---------------------------------------------------------------------------

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 pt-3 first:pt-0">
      <dt className="shrink-0 text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="text-right text-xs text-foreground">{value}</dd>
    </div>
  );
}

function MetricTile({ label, value, live }: { label: string; value: number; live?: boolean }) {
  return (
    <div className={cn(
      'rounded-lg border p-3 text-center',
      live ? 'border-success/30 bg-success-subtle' : 'bg-surface-sunken',
    )}>
      <p className={cn('text-2xl font-bold tabular-nums', live ? 'text-success' : 'text-foreground')}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}
