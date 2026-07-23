'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  TriangleAlert,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminApiError, fetchSupportTickets } from '@/lib/admin-api';
import type { SupportTicketSummary } from '@/lib/admin-api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ticketStatusBadge(status: string) {
  switch (status) {
    case 'OPEN': return <Badge variant="destructive">Open</Badge>;
    case 'IN_PROGRESS': return <Badge variant="live" dot>In Progress</Badge>;
    case 'RESOLVED': return <Badge variant="neutral">Resolved</Badge>;
    case 'CLOSED': return <Badge variant="outline">Closed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function priorityBadge(priority: string) {
  switch (priority) {
    case 'CRITICAL': return <Badge variant="destructive">Critical</Badge>;
    case 'HIGH': return <Badge variant="live">High</Badge>;
    case 'MEDIUM': return <Badge variant="neutral">Medium</Badge>;
    case 'LOW': return <Badge variant="outline">Low</Badge>;
    default: return <Badge variant="outline">{priority}</Badge>;
  }
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
      {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <LifeBuoy className="h-10 w-10 opacity-30" />
      <p className="text-sm font-medium">
        {search ? `No tickets found for "${search}"` : 'No tickets in the inbox.'}
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
      <TriangleAlert className="h-10 w-10 opacity-50" />
      <p className="text-sm font-medium">Failed to load tickets</p>
      <p className="text-xs text-ink-muted">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SupportInboxPage() {
  const router = useRouter();

  // Filter state
  const [searchInput, setSearchInput] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const LIMIT = 20;

  const search = useDebounce(searchInput, 300);

  // Reset to page 1 whenever filters change
  React.useEffect(() => { setPage(1); }, [search, statusFilter, priorityFilter]);

  // Data state
  const [tickets, setTickets] = React.useState<SupportTicketSummary[]>([]);
  const [meta, setMeta] = React.useState<{ total: number; page: number; pages: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSupportTickets({ search, status: statusFilter || undefined, priority: priorityFilter || undefined, page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setTickets(res.items);
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
  }, [search, statusFilter, priorityFilter, page, router]);

  const hasPrev = (meta?.page ?? 1) > 1;
  const hasNext = meta ? meta.page < meta.pages : false;

  return (
    <div className="min-h-screen bg-surface-canvas">
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
                Customer Support
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Support Inbox
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Triage and resolve customer support tickets.
              </p>
            </div>
            {meta && (
              <span className="text-xs text-ink-muted">
                {meta.total.toLocaleString()} total ticket{meta.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="search"
              placeholder="Search by email, name, or subject…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={cn(
                'w-full rounded-lg border bg-surface-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-ink-muted',
                'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
              )}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'rounded-lg border bg-surface-card px-3 py-2 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
            )}
          >
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={cn(
              'rounded-lg border bg-surface-card px-3 py-2 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
            )}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                {!loading && error && <tr><td colSpan={6}><ErrorState message={error} /></td></tr>}
                {!loading && !error && tickets.length === 0 && <tr><td colSpan={6}><EmptyState search={search} /></td></tr>}
                {!loading && !error && tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="group hover:bg-surface-raised transition-colors cursor-pointer"
                    onClick={() => router.push(`/support-inbox/${ticket._id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground group-hover:text-brand transition-colors">
                        {ticket.customerName || ticket.customerEmail.split('@')[0]}
                      </div>
                      <div className="text-xs text-ink-muted">{ticket.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary truncate max-w-xs" title={ticket.subject}>
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3">{ticketStatusBadge(ticket.status)}</td>
                    <td className="px-4 py-3">{priorityBadge(ticket.priority)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-ink-muted">
              <span>
                Page {meta.page} of {meta.pages} &middot; {meta.total.toLocaleString()} tickets
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev || loading}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                    hasPrev && !loading ? 'hover:bg-surface-raised text-foreground' : 'cursor-not-allowed opacity-40',
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || loading}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                    hasNext && !loading ? 'hover:bg-surface-raised text-foreground' : 'cursor-not-allowed opacity-40',
                  )}
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
