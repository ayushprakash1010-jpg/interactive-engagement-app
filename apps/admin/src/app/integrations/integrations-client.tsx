'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShieldCheck, ShieldAlert, Puzzle, Loader2, Video, Key } from 'lucide-react';
import { fetchAdminIntegrations } from '@/lib/admin-api';
import type { AdminIntegrationList } from '@/lib/admin-api';

function getProviderIcon(provider: string) {
  switch (provider.toLowerCase()) {
    case 'zoom':
    case 'meet':
    case 'teams':
    case 'webex':
      return <Video className="h-4 w-4" />;
    default:
      return <Puzzle className="h-4 w-4" />;
  }
}

export default function IntegrationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [data, setData] = React.useState<AdminIntegrationList | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchAdminIntegrations({ search: query, limit: 50 })
        .then((res) => {
          setData(res);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
      
      // Update URL silently
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-surface-canvas p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Integration Diagnostics
          </h1>
          <p className="mt-2 text-sm text-ink-muted max-w-2xl">
            Search by User Email, Zoom App-Specific ID, or External ID to diagnose active third-party integrations. 
            Sensitive tokens are never exposed in this view.
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8 rounded-xl bg-surface-card p-4 shadow-sm border border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by email, name, or integration ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-ink-muted transition-colors"
            />
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-brand font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && data && data.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-20 text-center">
            <Puzzle className="mx-auto h-8 w-8 text-ink-muted opacity-50" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">No integrations found</h3>
            <p className="mt-1 text-xs text-ink-muted">
              {query ? 'No users matching your search have active integrations.' : 'No active integrations exist on this platform.'}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((user) => (
            <div key={user.userId} className="flex flex-col overflow-hidden rounded-xl bg-surface-card border border-border shadow-sm">
              <div className="border-b bg-surface-sunken px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground truncate max-w-[200px]">{user.name}</h3>
                  <p className="text-xs text-ink-muted truncate max-w-[200px]">{user.email}</p>
                </div>
                <Link
                  href={`/users/${user.userId}`}
                  className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors"
                >
                  View User
                </Link>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {user.integrations.map((integration, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-surface p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(integration.provider)}
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {integration.provider}
                        </span>
                      </div>
                      {integration.status === 'Configured' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-surface-sunken px-2 py-0.5 rounded-full border border-border">
                          <ShieldAlert className="h-3 w-3 opacity-50" /> Unknown
                        </span>
                      )}
                    </div>
                    
                    <dl className="space-y-2 text-xs">
                      <div>
                        <dt className="font-medium text-ink-muted">External ID</dt>
                        <dd className="font-mono text-foreground break-all">{integration.externalId}</dd>
                      </div>
                      {integration.zoomUserId && (
                        <div>
                          <dt className="font-medium text-ink-muted flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            Zoom User ID
                          </dt>
                          <dd className="font-mono text-foreground break-all">{integration.zoomUserId}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
