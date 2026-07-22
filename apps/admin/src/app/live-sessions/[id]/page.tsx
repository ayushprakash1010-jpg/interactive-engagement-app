'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  CalendarDays,
  Settings,
  Puzzle,
  User,
  TriangleAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AdminApiError, fetchAdminEvent } from '@/lib/admin-api';
import type { AdminEventDetail } from '@/lib/admin-api';
import { LiveDiagnostics } from './live-diagnostics';
import { InvestigateButton } from '@/components/admin/investigate-button';
import { GlobalCopilot } from '@/components/admin/global-copilot';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function eventStatusBadge(status: 'draft' | 'live' | 'ended') {
  if (status === 'live') return <Badge variant="live" dot>Live Now</Badge>;
  if (status === 'ended') return <Badge variant="neutral">Ended</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-surface-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle text-brand">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 pt-3 first:pt-0">
      <dt className="shrink-0 text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="text-right text-xs text-foreground">{value}</dd>
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-ink-secondary">{label}</span>
      {enabled ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Enabled
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <XCircle className="h-3.5 w-3.5" />
          Disabled
        </span>
      )}
    </div>
  );
}

function IntegrationRow({ provider, externalId }: { provider: string; externalId: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground capitalize">{provider}</p>
        <p className="text-xs text-ink-muted font-mono mt-0.5">{externalId}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Linked
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [event, setEvent] = React.useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchAdminEvent(id)
      .then(setEvent)
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
              { label: 'Live Sessions', href: '/live-sessions' },
              { label: event ? event.name : 'Live Session Profile' }
            ]} 
            className="mb-4"
          />

          {loading && (
            <div className="h-8 w-64 rounded bg-surface-sunken animate-pulse" />
          )}
          {!loading && event && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {event.name}
                </h1>
                {eventStatusBadge(event.status)}
              </div>
              <div className="flex items-center gap-3">
                <InvestigateButton resourceType="live-session" resourceId={event.id} />
                <Link 
                  href={`/audit-logs?resource=${event.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Audit History
                </Link>
              </div>
            </div>
          )}
          {!loading && notFound && (
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Live Session Not Found
            </h1>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading live session…
          </div>
        )}

        {/* Not Found */}
        {!loading && notFound && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-muted">
            <TriangleAlert className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">Session not found</p>
            <p className="text-xs">
              The ID <code className="font-mono text-2xs bg-surface-sunken px-1 py-0.5 rounded">{id}</code> does not match any event.
            </p>
            <Link href="/live-sessions" className="mt-2 text-xs font-medium text-brand hover:underline">
              Back to live sessions
            </Link>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
            <TriangleAlert className="h-10 w-10 opacity-50" />
            <p className="text-sm font-medium">Failed to load event</p>
            <p className="text-xs text-ink-muted">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && event && (
          <>
            {event.status === 'live' && <LiveDiagnostics eventId={id} />}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column */}
            <div className="space-y-6 lg:col-span-1">
              <SectionCard icon={CalendarDays} title="Event Profile">
                <dl className="space-y-3 text-sm divide-y divide-border">
                  <InfoRow
                    label="Join Code"
                    value={
                      <span className="font-mono font-bold tracking-widest text-foreground px-2 py-1 bg-surface-sunken rounded border border-border">
                        {event.eventCode}
                      </span>
                    }
                  />
                  <InfoRow label="Created At" value={formatDateTime(event.createdAt)} />
                  <InfoRow label="Description" value={event.description || 'No description provided.'} />
                  <InfoRow
                    label="Mongo ID"
                    value={
                      <span className="font-mono text-2xs break-all text-ink-muted">
                        {event.id}
                      </span>
                    }
                  />
                </dl>
              </SectionCard>

              <SectionCard icon={User} title="Host Details">
                <dl className="space-y-3 text-sm divide-y divide-border">
                  <InfoRow label="Name" value={event.host.name} />
                  <InfoRow label="Email" value={event.host.email} />
                </dl>
                <div className="mt-5 text-center">
                  <Link
                    href={`/users/${event.host.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border bg-surface py-2 text-xs font-medium text-foreground hover:bg-surface-raised transition-colors"
                  >
                    View Host Profile
                  </Link>
                </div>
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="space-y-6 lg:col-span-2">
              <SectionCard icon={Clock} title="Scheduling & Status">
                <dl className="space-y-3 text-sm divide-y divide-border">
                  <InfoRow label="Scheduled Start" value={formatDateTime(event.scheduledStart)} />
                  <InfoRow label="Scheduled End" value={formatDateTime(event.scheduledEnd)} />
                  <InfoRow label="Timezone" value={event.timezone || 'Not specified'} />
                </dl>
              </SectionCard>

              <SectionCard icon={Settings} title="Event Settings">
                <div className="divide-y divide-border">
                  <ToggleRow label="Anonymous Q&A" enabled={event.settings.allowAnonymousQA} />
                  <ToggleRow label="Require Moderation" enabled={event.settings.requireModeration} />
                  <ToggleRow label="Require Participant Names" enabled={event.settings.participantNames} />
                </div>
              </SectionCard>

              <SectionCard icon={Puzzle} title="Active Integrations">
                {event.integrations.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-muted">No external integrations linked to this event.</p>
                ) : (
                  <div>
                    {event.integrations.map((int, i) => (
                      <IntegrationRow key={i} provider={int.provider} externalId={int.externalId} />
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
            </div>
          </>
        )}
      </div>
      {!loading && event && (
        <GlobalCopilot 
          pageContext={{ 
            type: 'live-session', 
            id: event.id
          }} 
        />
      )}
    </div>
  );
}
