'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  TriangleAlert,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminApiError, fetchAdminEvents } from '@/lib/admin-api';
import type { AdminEventSummary, AdminEventListMeta } from '@/lib/admin-api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function eventStatusBadge(status: 'draft' | 'live' | 'ended') {
  if (status === 'live') return <Badge variant="live" dot>Live</Badge>;
  if (status === 'ended') return <Badge variant="neutral">Ended</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-surface-sunken animate-pulse" style={{ width: `${60 + i * 5}%` }} />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-muted">
      <CalendarDays className="h-10 w-10 opacity-30" />
      <p className="text-sm font-medium">
        {search ? `No events found for "${search}"` : 'No events yet.'}
      </p>
      {search && (
        <p className="text-xs">Try a different name, 6-digit Join Code, or Host ID.</p>
      )}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
      <TriangleAlert className="h-10 w-10 opacity-50" />
      <p className="text-sm font-medium">Failed to load events</p>
      <p className="text-xs text-ink-muted">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EventsPage() {
  const router = useRouter();

  // Filter state
  const [searchInput, setSearchInput] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const LIMIT = 20;

  // Debounce the search input
  const search = useDebounce(searchInput, 300);

  // Reset to page 1 whenever filters change
  React.useEffect(() => { setPage(1); }, [search, statusFilter]);

  // Data state
  const [events, setEvents] = React.useState<AdminEventSummary[]>([]);
  const [meta, setMeta] = React.useState<AdminEventListMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdminEvents({ search, status: statusFilter || undefined, page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setEvents(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AdminApiError && err.status === 401) {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [search, statusFilter, page, router]);

  const hasPrev = (meta?.page ?? 1) > 1;
  const hasNext = meta ? meta.page < meta.totalPages : false;

  return (
    <div className="min-h-screen bg-surface-canvas">
      {/* Page header */}
      <div className="border-b bg-surface-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/home"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Admin Home
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand mb-1">
                Platform Operations
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Events
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Search and inspect all events across the platform.
              </p>
            </div>
            {meta && (
              <span className="text-xs text-ink-muted">
                {meta.total.toLocaleString()} total event{meta.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Search + filter bar */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              id="event-search"
              type="search"
              placeholder="Name, 6-digit Code, or Host ID…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={cn(
                'w-full rounded-lg border bg-surface-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-ink-muted',
                'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
              )}
            />
          </div>

          {/* Status filter */}
          <select
            id="event-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'rounded-lg border bg-surface-card px-3 py-2 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
            )}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="live">Live Now</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {/* Results table */}
        <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 text-left">Event Name</th>
                  <th className="px-4 py-3 text-left">Join Code</th>
                  <th className="px-4 py-3 text-left">Host</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && error && (
                  <tr>
                    <td colSpan={5}>
                      <ErrorState message={error} />
                    </td>
                  </tr>
                )}

                {!loading && !error && events.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState search={search} />
                    </td>
                  </tr>
                )}

                {!loading && !error && events.map((event) => (
                  <tr
                    key={event.id}
                    className="group hover:bg-surface-raised transition-colors cursor-pointer"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground group-hover:text-brand transition-colors">
                      {event.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-1 bg-surface-sunken border rounded tracking-widest text-ink-secondary">
                        {event.eventCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {event.hostName}
                    </td>
                    <td className="px-4 py-3">{eventStatusBadge(event.status)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(event.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-ink-muted">
              <span>
                Page {meta.page} of {meta.totalPages} &middot; {meta.total.toLocaleString()} events
              </span>
              <div className="flex items-center gap-1">
                <button
                  id="events-prev-page"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev || loading}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                    hasPrev && !loading
                      ? 'hover:bg-surface-raised text-foreground'
                      : 'cursor-not-allowed opacity-40',
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  id="events-next-page"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || loading}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                    hasNext && !loading
                      ? 'hover:bg-surface-raised text-foreground'
                      : 'cursor-not-allowed opacity-40',
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-ink-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}
