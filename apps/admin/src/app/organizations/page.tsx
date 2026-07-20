'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Building,
  TriangleAlert,
  Loader2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminApiError, fetchAdminOrganizations, createAdminOrganization } from '@/lib/admin-api';
import type { AdminOrganizationSummary } from '@/lib/admin-api';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

export default function OrganizationsPage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [page, setPage] = React.useState(1);
  const LIMIT = 20;

  const search = useDebounce(searchInput, 300);

  React.useEffect(() => { setPage(1); }, [search]);

  const [orgs, setOrgs] = React.useState<AdminOrganizationSummary[]>([]);
  const [meta, setMeta] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isCreating, setIsCreating] = React.useState(false);
  const [createName, setCreateName] = React.useState('');
  const [createPlan, setCreatePlan] = React.useState('free');
  const [createLoading, setCreateLoading] = React.useState(false);

  const loadOrganizations = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminOrganizations({ search, page, limit: LIMIT });
      setOrgs(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [search, page, router]);

  React.useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await createAdminOrganization({ name: createName, plan: createPlan });
      setIsCreating(false);
      setCreateName('');
      loadOrganizations();
      router.push(`/organizations/${res.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setCreateLoading(false);
    }
  };

  const hasPrev = (meta?.page ?? 1) > 1;
  const hasNext = meta ? meta.page < meta.totalPages : false;

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
                Governance
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building className="h-6 w-6 text-brand" /> Organizations
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Manage multi-tenant organizations and their plans.
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
              >
                <Plus className="h-4 w-4" /> Create Organization
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {isCreating && (
          <div className="rounded-xl border bg-surface-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Create New Organization</h2>
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-ink-muted mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  className="w-full rounded-md border bg-surface-sunken px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="w-[150px]">
                <label className="block text-xs font-medium text-ink-muted mb-1">Plan</label>
                <select
                  value={createPlan}
                  onChange={e => setCreatePlan(e.target.value)}
                  className="w-full rounded-md border bg-surface-sunken px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-surface-raised"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createName.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
                >
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="search"
              placeholder="Search organizations…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border bg-surface-card py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Total Users</th>
                  <th className="px-4 py-3 text-left">Total Events</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                      <TriangleAlert className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && orgs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                      No organizations found.
                    </td>
                  </tr>
                )}
                {!loading && !error && orgs.map((org) => (
                  <tr
                    key={org.id}
                    className="group hover:bg-surface-raised transition-colors cursor-pointer"
                    onClick={() => router.push(`/organizations/${org.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground group-hover:text-brand">{org.name}</td>
                    <td className="px-4 py-3 capitalize text-ink-secondary">{org.plan}</td>
                    <td className="px-4 py-3 text-ink-secondary">{org.totalUsers}</td>
                    <td className="px-4 py-3 text-ink-secondary">{org.totalEvents}</td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(org.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-ink-muted">
              <span>Page {meta.page} of {meta.totalPages} &middot; {meta.total} orgs</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev || loading}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-md border', hasPrev && !loading ? 'hover:bg-surface-raised text-foreground' : 'cursor-not-allowed opacity-40')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || loading}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-md border', hasNext && !loading ? 'hover:bg-surface-raised text-foreground' : 'cursor-not-allowed opacity-40')}
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
