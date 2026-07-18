import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Users,
  CalendarDays,
  Radio,
  Puzzle,
  ScrollText,
  BarChart3,
  LifeBuoy,
  BookOpen,
  HeartPulse,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { WorkspaceCard } from '@/components/admin/workspace-card';
import { fetchAdminMeServer, AdminApiError } from '@/lib/admin-api';

export const metadata: Metadata = { title: 'Home' };
export const dynamic = 'force-dynamic';

/**
 * Admin Workspace Launcher — Phase 1 deliverable.
 *
 * This is a Server Component. fetchAdminMeServer() is called server-side via the
 * internal API URL (not through the browser proxy). If the user is not an
 * admin, NestJS returns 403 and we redirect to /access-denied.
 *
 * Future workspace cards display a clear "Coming soon" state per the roadmap.
 */
export default async function HomePage() {
  let me;
  try {
    me = await fetchAdminMeServer();
  } catch (err) {
    if (err instanceof AdminApiError) {
      if (err.status === 401) redirect('/login');
      if (err.status === 403) redirect('/access-denied');
    }
    // Other errors (network, 500, etc.) — let Next.js error boundary handle
    throw err;
  }

  return (
    <AdminShell user={me}>
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* Welcome header */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Internal Operations
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {me.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-ink-secondary">
            Pulse Admin Console · {me.email}
          </p>
        </div>

        {/* ── CUSTOMER SUPPORT ─────────────────────────────── */}
        <section aria-labelledby="section-support">
          <h2
            id="section-support"
            className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Customer Support
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WorkspaceCard
              title="Users & Hosts"
              description="Look up a host by email, name, or ID. View profile, integrations, and run support actions."
              icon={Users}
              comingSoon
            />
            <WorkspaceCard
              title="Support Inbox"
              description="Triage support submissions from the public contact form."
              icon={LifeBuoy}
              comingSoon
            />
            <WorkspaceCard
              title="Knowledge Base"
              description="Author the support team's internal runbooks and grounding content."
              icon={BookOpen}
              comingSoon
            />
          </div>
        </section>

        {/* ── PLATFORM OPERATIONS ──────────────────────────── */}
        <section aria-labelledby="section-platform">
          <h2
            id="section-platform"
            className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Platform Operations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WorkspaceCard
              title="Events"
              description="Search events by code, host, or date. View event details and activity diagnostics."
              icon={CalendarDays}
              comingSoon
            />
            <WorkspaceCard
              title="Live Sessions"
              description="Monitor currently live events. View real-time diagnostics and force-end sessions if needed."
              icon={Radio}
              comingSoon
            />
            <WorkspaceCard
              title="Integrations"
              description="Inspect Zoom, Teams, Meet, Slides, and PowerPoint integration health per user."
              icon={Puzzle}
              comingSoon
            />
          </div>
        </section>

        {/* ── GOVERNANCE ───────────────────────────────────── */}
        <section aria-labelledby="section-governance">
          <h2
            id="section-governance"
            className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Governance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WorkspaceCard
              title="Audit Logs"
              description="Search the immutable log of all admin actions — who did what, and when."
              icon={ScrollText}
              comingSoon
            />
          </div>
        </section>

        {/* ── ANALYTICS & SYSTEM ───────────────────────────── */}
        <section aria-labelledby="section-analytics">
          <h2
            id="section-analytics"
            className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Analytics &amp; System
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WorkspaceCard
              title="Platform Analytics"
              description="Platform-wide usage metrics, host growth, and activity trends."
              icon={BarChart3}
              comingSoon
            />
            <WorkspaceCard
              title="System Health"
              description="MongoDB, Redis, Socket.IO, and API endpoint status at a glance."
              icon={HeartPulse}
              comingSoon
            />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
