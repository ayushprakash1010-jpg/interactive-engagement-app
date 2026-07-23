'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Users, Activity, Loader2, ShieldAlert } from 'lucide-react';
import { fetchEventDiagnostics, forceEndAdminEvent, AdminApiError } from '@/lib/admin-api';
import type { AdminEventDiagnostics } from '@/lib/admin-api';

export function LiveDiagnostics({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [stats, setStats] = React.useState<AdminEventDiagnostics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [ending, setEnding] = React.useState(false);

  // Poll every 5 seconds
  React.useEffect(() => {
    let cancelled = false;
    
    function load() {
      fetchEventDiagnostics(eventId)
        .then((res) => {
          if (!cancelled) {
            setStats(res);
            setLoading(false);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Failed to fetch diagnostics');
            setLoading(false);
          }
        });
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [eventId]);

  const [showModal, setShowModal] = React.useState(false);
  const [reason, setReason] = React.useState('');

  async function handleForceEnd() {
    setEnding(true);
    try {
      await forceEndAdminEvent(eventId, reason || undefined);
      window.location.reload();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : 'Failed to end event');
      setEnding(false);
      setShowModal(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-brand/20 bg-brand/5 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between border-b border-brand/20 px-5 py-4 bg-brand/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground relative">
              <Radio className="h-4 w-4" aria-hidden />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse border-2 border-surface-card" />
            </div>
            <h2 className="text-sm font-semibold text-brand-dark">Live Diagnostics</h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={ending}
            className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {ending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            Force End Session
          </button>
        </div>
        
        <div className="p-5">
          {loading && !stats && (
            <div className="flex items-center gap-2 text-xs text-brand/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Connecting to realtime gateway…
            </div>
          )}
          
          {error && (
            <div className="text-xs text-destructive">
              {error}
            </div>
          )}

          {stats && (
            <div className="flex gap-10">
              <div className="flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-wider text-brand/60">Connected Sockets</span>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand" />
                  <span className="text-2xl font-display font-bold text-foreground">
                    {stats.connectedSockets.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-2xs font-semibold uppercase tracking-wider text-brand/60">Active Activities</span>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-brand" />
                  <span className="text-lg font-medium text-foreground">
                    {stats.activeActivityId ? (
                      <span className="text-brand">Yes (Active)</span>
                    ) : (
                      <span className="text-ink-muted">None</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Force End Session</h3>
            <p className="text-sm text-ink-secondary mb-4">
              This action will immediately terminate the event and disconnect all active participants. This action cannot be undone.
            </p>
            <div className="mb-6">
              <label htmlFor="reason" className="block text-xs font-semibold text-ink-muted mb-1.5">
                Reason (Optional, recorded in Audit Log)
              </label>
              <textarea
                id="reason"
                maxLength={255}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-border bg-surface p-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="E.g., Event ran over scheduled time, inappropriate content..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={ending}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForceEnd}
                disabled={ending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                Force End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
