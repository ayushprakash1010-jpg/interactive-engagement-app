'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ScrollText, Loader2, Calendar, User, ShieldAlert, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAuditLogs } from '@/lib/admin-api';
import type { AuditLogList } from '@/lib/admin-api';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('q') || searchParams.get('resource') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialActionType = searchParams.get('action') || '';
  const initialTargetResourceType = searchParams.get('type') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [actionType, setActionType] = React.useState(initialActionType);
  const [targetResourceType, setTargetResourceType] = React.useState(initialTargetResourceType);
  const [page, setPage] = React.useState(initialPage);
  
  const [data, setData] = React.useState<AuditLogList | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Debounced load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchAuditLogs({ search: query, actionType, targetResourceType, page, limit: 20 })
        .then((res) => {
          setData(res);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
      
      // Update URL silently
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
      if (actionType) url.searchParams.set('action', actionType); else url.searchParams.delete('action');
      if (targetResourceType) url.searchParams.set('type', targetResourceType); else url.searchParams.delete('type');
      if (page > 1) url.searchParams.set('page', page.toString()); else url.searchParams.delete('page');
      window.history.replaceState({}, '', url);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, actionType, targetResourceType, page]);

  return (
    <div className="min-h-screen bg-surface-canvas p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Audit Logs
            </h1>
            <p className="mt-2 text-sm text-ink-muted max-w-2xl">
              Immutable record of all administrative actions. Search by Admin Email or Target Resource ID.
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-brand font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading records...
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by Admin Email or Resource ID..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-ink-muted"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={actionType}
              onChange={(e) => { setActionType(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border bg-surface px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All Actions</option>
              <option value="FORCE_END_EVENT">Force End Event</option>
              {/* Add future actions here */}
            </select>
          </div>
          <div className="w-full md:w-64">
            <select
              value={targetResourceType}
              onChange={(e) => { setTargetResourceType(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border bg-surface px-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All Resource Types</option>
              <option value="Event">Event</option>
              <option value="User">User</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && data && data.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-ink-muted opacity-50" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">No audit logs found</h3>
            <p className="mt-1 text-xs text-ink-muted">
              {query || actionType ? 'No records match your filters.' : 'The audit log is empty.'}
            </p>
          </div>
        )}

        {/* Table */}
        {data && data.data.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-ink-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Admin</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Target Resource</th>
                    <th className="px-6 py-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-sunken/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-ink">
                          <Calendar className="h-4 w-4 text-ink-muted" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-brand" />
                          <span className="font-medium text-foreground">{log.adminEmail}</span>
                        </div>
                        <div className="text-[10px] text-ink-muted font-mono mt-0.5">{log.adminId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-canvas px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand border border-brand/20">
                          {log.actionType === 'FORCE_END_EVENT' && <ShieldAlert className="h-3 w-3" />}
                          {log.actionType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-foreground">{log.targetResourceType}</div>
                        <div className="text-[10px] text-ink-muted font-mono">{log.targetResourceId}</div>
                        {log.targetResourceType === 'Event' && (
                          <Link href={`/events/${log.targetResourceId}`} className="text-[10px] text-brand hover:underline mt-1 inline-block">
                            View Event
                          </Link>
                        )}
                        {log.targetResourceType === 'User' && (
                          <Link href={`/users/${log.targetResourceId}`} className="text-[10px] text-brand hover:underline mt-1 inline-block">
                            View User
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        {log.reason ? (
                          <div className="flex items-start gap-1.5 text-ink-secondary">
                            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="text-xs line-clamp-2" title={log.reason}>{log.reason}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-muted italic">No reason provided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {data.meta.totalPages > 1 && (
              <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-surface-sunken">
                <span className="text-xs text-ink-muted">
                  Showing page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="inline-flex items-center justify-center rounded border border-border bg-surface px-2.5 py-1.5 text-ink hover:bg-surface-raised disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                    disabled={page === data.meta.totalPages || loading}
                    className="inline-flex items-center justify-center rounded border border-border bg-surface px-2.5 py-1.5 text-ink hover:bg-surface-raised disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
