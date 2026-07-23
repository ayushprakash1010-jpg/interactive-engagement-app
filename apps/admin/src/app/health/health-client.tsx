'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { fetchSystemHealth, type SystemHealth } from '@/lib/admin-api';
import { Loader2, Database, HeartPulse, HardDrive, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function HealthClient() {
  const router = useRouter();
  const [data, setData] = React.useState<SystemHealth | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadHealth = () => {
    setLoading(true);
    fetchSystemHealth()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        // The API returns 503 if degraded, which throws AdminApiError, but we might still want to parse the body.
        // For simplicity, we just show the error string if it fails to parse.
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    loadHealth();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-surface-canvas p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center text-sm font-medium text-ink-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              System Health
            </h1>
            <p className="mt-2 text-sm text-ink-muted max-w-2xl">
              Live status of backend services and databases. Auto-refreshes every 30 seconds.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadHealth} disabled={loading} className="text-sm font-medium text-brand hover:underline disabled:opacity-50">
              Refresh Now
            </button>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-brand font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Pinging...
              </div>
            )}
          </div>
        </div>

        {error && !data && (
          <div className="mb-8 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex flex-col items-center justify-center py-12">
            <XCircle className="h-10 w-10 mb-4 opacity-80" />
            <p className="font-semibold text-lg">API Unreachable</p>
            <p className="mt-1 opacity-80">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Overall Status */}
              <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between transition-colors ${data.status === 'ok' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-destructive/20 bg-destructive/5'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Platform Status</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight capitalize">{data.status.replace('_', ' ')}</h3>
                  </div>
                  <div className={`rounded-full p-2 ${data.status === 'ok' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/20 text-destructive'}`}>
                    <HeartPulse className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Database */}
              <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between transition-colors ${data.info?.mongodb?.status === 'up' ? 'border-border bg-surface-card hover:border-brand/30' : 'border-destructive/20 bg-destructive/5'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">MongoDB</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      {data.info?.mongodb?.status === 'up' ? 'Online' : 'Offline'}
                    </h3>
                  </div>
                  <div className="rounded-full bg-brand/10 p-2 text-brand">
                    <Database className="h-5 w-5" />
                  </div>
                </div>
                {data.info?.mongodb?.status === 'up' ? (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> Disconnected
                  </div>
                )}
              </div>

              {/* Redis */}
              <div className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between transition-colors ${data.info?.redis?.status === 'up' ? 'border-border bg-surface-card hover:border-brand/30' : 'border-destructive/20 bg-destructive/5'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Redis Gateway</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      {data.info?.redis?.status === 'up' ? 'Online' : 'Offline'}
                    </h3>
                  </div>
                  <div className="rounded-full bg-brand/10 p-2 text-brand">
                    <HardDrive className="h-5 w-5" />
                  </div>
                </div>
                {data.info?.redis?.status === 'up' ? (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> Disconnected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
