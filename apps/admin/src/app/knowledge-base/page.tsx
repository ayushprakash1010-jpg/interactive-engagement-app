'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  TriangleAlert,
  Loader2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminApiError, fetchKnowledgeArticles } from '@/lib/admin-api';
import type { KnowledgeArticleSummary } from '@/lib/admin-api';

function statusBadge(status: string) {
  switch (status) {
    case 'PUBLISHED': return <Badge variant="live">Published</Badge>;
    case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
    case 'ARCHIVED': return <Badge variant="neutral">Archived</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(iso: string | null) {
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

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
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
      <BookOpen className="h-10 w-10 opacity-30" />
      <p className="text-sm font-medium">
        {search ? `No articles found for "${search}"` : 'No articles yet.'}
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
      <TriangleAlert className="h-10 w-10 opacity-50" />
      <p className="text-sm font-medium">Failed to load articles</p>
      <p className="text-xs text-ink-muted">{message}</p>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const router = useRouter();

  const [searchInput, setSearchInput] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const LIMIT = 20;

  const search = useDebounce(searchInput, 300);

  React.useEffect(() => { setPage(1); }, [search, categoryFilter]);

  const [articles, setArticles] = React.useState<KnowledgeArticleSummary[]>([]);
  const [meta, setMeta] = React.useState<{ total: number; page: number; pages: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchKnowledgeArticles({ search, category: categoryFilter || undefined, page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setArticles(res.items);
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
  }, [search, categoryFilter, page, router]);

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
                Knowledge Base
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Internal runbooks, FAQs, and troubleshooting guides.
              </p>
            </div>
            <Link
              href="/knowledge-base/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
            >
              <Plus className="h-4 w-4" />
              New Article
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="search"
              placeholder="Search title, summary, or content…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={cn(
                'w-full rounded-lg border bg-surface-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-ink-muted',
                'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
              )}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={cn(
              'rounded-lg border bg-surface-card px-3 py-2 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow',
            )}
          >
            <option value="">All categories</option>
            <option value="Account & Authentication">Account & Auth</option>
            <option value="Events">Events</option>
            <option value="Integrations">Integrations</option>
            <option value="AI Studio">AI Studio</option>
            <option value="Feature Flags">Feature Flags</option>
            <option value="Organizations">Organizations</option>
            <option value="Billing & Plans">Billing & Plans</option>
            <option value="Troubleshooting">Troubleshooting</option>
            <option value="System Operations">System Operations</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface-sunken text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                {!loading && error && <tr><td colSpan={4}><ErrorState message={error} /></td></tr>}
                {!loading && !error && articles.length === 0 && <tr><td colSpan={4}><EmptyState search={search} /></td></tr>}
                {!loading && !error && articles.map((article) => (
                  <tr
                    key={article._id}
                    className="group hover:bg-surface-raised transition-colors cursor-pointer"
                    onClick={() => router.push(`/knowledge-base/${article.slug}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground group-hover:text-brand transition-colors">
                        {article.title}
                      </div>
                      <div className="text-xs text-ink-muted">{article.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {article.category}
                    </td>
                    <td className="px-4 py-3">{statusBadge(article.status)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(article.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-ink-muted">
              <span>
                Page {meta.page} of {meta.pages} &middot; {meta.total.toLocaleString()} articles
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
