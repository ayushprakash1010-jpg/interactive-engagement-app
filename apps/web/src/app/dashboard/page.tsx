'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  HelpCircle,
  Keyboard,
  LayoutDashboard,
  MessageSquareDashed,
  MoreHorizontal,
  PenLine,
  PlayCircle,
  Plus,
  RadioTower,
  Settings,
  Share,
  Sparkles,
  Terminal,
  Trash2,
  TrendingUp,
  Users,
  Zap,
  ClipboardList,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingSkeleton,
  MetricCardSkeleton,
  ListSkeleton,
  ChartSkeleton,
  MetricCard,
  PageHeader,
  StatusBadge,
} from '@/components/ui';
import { useDeleteEvent, useEvents } from '@/lib/use-events';
import { useNotifications } from '@/lib/notification-store';
import { useAuth } from '@/lib/use-auth';
import { openCommandPalette } from '@/lib/command-palette-store';
import { requestOpenNotificationCenter } from '@/lib/notification-center-store';
import { cn } from '@/lib/utils';
import type { Event } from '@iep/types';
import type { Notification } from '@/lib/notification-store';
import { useOverviewStats } from '@/lib/use-overview';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getGreeting(user: { name?: string | null; nickname?: string | null } | undefined | null): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good evening';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 18) timeGreeting = 'Good afternoon';

  const displayName = user?.nickname || user?.name?.split('@')[0] || null;
  return displayName ? `${timeGreeting}, ${displayName} 👋` : `${timeGreeting} 👋`;
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function getNotificationIcon(notification: Notification) {
  const t = notification.type;
  if (t.startsWith('ai-')) return Sparkles;
  if (t.includes('poll')) return RadioTower;
  if (t.includes('survey')) return ClipboardList;
  if (t.includes('quiz')) return BrainCircuit;
  if (t.includes('wordcloud')) return Cloud;
  if (t.includes('feedback')) return FileText;
  if (t.includes('participant')) return Users;
  if (t.includes('analytics')) return BarChart3;
  if (t.includes('session')) return Clock;
  return Calendar;
}

function getNotificationColor(notification: Notification): string {
  switch (notification.category) {
    case 'ai': return 'bg-ai-subtle text-ai';
    case 'success': return 'bg-success-subtle text-success';
    case 'event': return 'bg-brand-subtle text-brand';
    case 'analytics': return 'bg-info-subtle text-info';
    case 'warning': return 'bg-warning-subtle text-[var(--warning-text)]';
    case 'error': return 'bg-error-subtle text-destructive';
    default: return 'bg-surface-sunken text-ink-muted';
  }
}

// ---------------------------------------------------------------------------
// Section: Workspace Metrics
// ---------------------------------------------------------------------------

function WorkspaceMetrics() {
  const { overview, isLoading } = useOverviewStats();

  if (isLoading || !overview) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { totalEvents, draftCount, completedCount, liveCount, totalParticipants, totalResponses, aiUsage } = overview;

  const metrics = [
    {
      label: 'Total Events',
      value: totalEvents,
      description: 'across your workspace',
      icon: <Calendar className="h-5 w-5" />,
      trend: totalEvents > 0 ? `${draftCount} Draft • ${completedCount} Completed` : null,
    },
    {
      label: 'Active Sessions',
      value: liveCount,
      description: liveCount === 1 ? 'session live now' : 'sessions live now',
      icon: <Zap className="h-5 w-5" />,
      trend: liveCount > 0 ? 'Live right now' : null,
      liveGlow: liveCount > 0,
    },
    {
      label: 'Participants',
      value: totalParticipants,
      description: 'total participants',
      icon: <Users className="h-5 w-5" />,
      trend: totalEvents > 0 ? 'Across all sessions' : null,
    },
    {
      label: 'Responses',
      value: totalResponses,
      description: 'total responses collected',
      icon: <TrendingUp className="h-5 w-5" />,
      trend: totalEvents > 0 ? 'Real-time updates' : null,
    },
    {
      label: 'AI Usage',
      value: aiUsage,
      description: 'AI generations used',
      icon: <Sparkles className="h-5 w-5" />,
      trend: 'Lifetime usage',
      ai: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          label={m.label}
          value={m.value}
          description={m.description}
          icon={
            <span className={cn(m.ai ? 'text-ai' : m.liveGlow ? 'text-live' : 'text-ink-secondary')}>
              {m.icon}
            </span>
          }
          trend={m.trend ?? undefined}
          className={cn(
            'transition-all duration-base ease-standard hover:-translate-y-0.5 hover:shadow-md',
            m.liveGlow && 'border-live/40',
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Recent Activity (from notification store)
// ---------------------------------------------------------------------------

function ActivityTimeline({ notifications }: { notifications: Notification[] }) {
  const recent = notifications.slice(0, 8);

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-5 w-5" />}
        title="No recent activity"
        description="Create an event or launch an activity to see updates."
        className="border-dashed bg-surface-card py-8"
      />
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border rounded-lg border border-border bg-surface-card overflow-hidden">
      {recent.map((n, idx) => {
        const Icon = getNotificationIcon(n);
        const iconClass = getNotificationColor(n);
        return (
          <div
            key={n.id}
            className={cn(
              'group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken/60',
              idx === 0 && 'rounded-t-lg',
              idx === recent.length - 1 && 'rounded-b-lg',
            )}
            onClick={() => requestOpenNotificationCenter()}
          >
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-transform duration-base group-hover:scale-105 group-hover:shadow-sm',
                iconClass,
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-brand">{n.title}</p>
              <p className="mt-0.5 truncate text-xs text-ink-muted">{n.description}</p>
            </div>
            <time className="shrink-0 text-xs text-ink-faint">
              {formatRelativeTime(n.timestamp)}
            </time>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Quick Action Cards
// ---------------------------------------------------------------------------

type QuickAction = {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  iconColor: string;
  onClick?: () => void;
  href?: string;
};

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  const inner = (
    <div
      className={cn(
        'group flex h-full flex-col gap-3 rounded-lg border border-border bg-surface-card p-4',
        'transition-all duration-base ease-standard',
        'hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md',
        'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-base group-hover:scale-105',
          action.color,
        )}
      >
        <Icon className={cn('h-4 w-4', action.iconColor)} aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
          {action.label}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">{action.description}</p>
      </div>
    </div>
  );

  if (action.href) {
    return (
      <Link href={action.href} className="h-full">
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className="h-full w-full text-left">
      {inner}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section: Recent Events
// ---------------------------------------------------------------------------

function RecentEventRow({ event }: { event: Event }) {
  const deleteEvent = useDeleteEvent();
  const updatedAt = event.updatedAt
    ? formatRelativeTime(String(event.updatedAt))
    : '—';

  return (
    <div className="group relative flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-sunken/60">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{event.name}</p>
          <StatusBadge status={event.status} size="sm" />
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">Updated {updatedAt}</p>
      </div>

      {/* Actions Container */}
      <div className="flex shrink-0 items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
          <Link href={`/dashboard/events/${event._id}/analytics`}>
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/events/${event._id}`}>
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open</span>
          </Link>
        </Button>

        {/* Hover Overflow Menu (Desktop) */}
        <div className="hidden max-w-0 items-center overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:max-w-[200px] group-hover:opacity-100 sm:flex">
          <div className="ml-1 flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface-card p-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-ink-secondary hover:bg-surface-sunken hover:text-foreground" title="Duplicate (coming soon)">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-ink-secondary hover:bg-surface-sunken hover:text-foreground" title="Rename (coming soon)">
              <PenLine className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-ink-secondary hover:bg-surface-sunken hover:text-foreground" title="Share">
              <Share className="h-3.5 w-3.5" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border"></div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-ink-secondary hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
              disabled={deleteEvent.isPending}
              onClick={() => deleteEvent.mutate(event._id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: AI Workspace
// ---------------------------------------------------------------------------

function AIWorkspacePanel({ notifications }: { notifications: Notification[] }) {
  const { overview } = useOverviewStats();
  const aiNotifications = notifications.filter((n) => n.category === 'ai');
  const lastAI = aiNotifications[0];

  const pollsGen = overview?.activitiesByType?.poll ?? 0;
  const quizGen = overview?.activitiesByType?.quiz ?? 0;
  const surveyGen = overview?.activitiesByType?.survey ?? 0;
  const feedbackGen = overview?.activitiesByType?.feedback ?? 0;
  const cloudGen = overview?.activitiesByType?.wordcloud ?? 0;

  const quickGenActions = [
    { icon: RadioTower, label: 'Poll', href: '/dashboard/ai' },
    { icon: BrainCircuit, label: 'Quiz', href: '/dashboard/ai' },
    { icon: ClipboardList, label: 'Survey', href: '/dashboard/ai' },
    { icon: MessageSquareDashed, label: 'Feedback', href: '/dashboard/ai' },
  ];

  return (
    <Card className="overflow-hidden border-ai/20 shadow-sm transition-all duration-300 hover:border-ai/40 hover:shadow-md">
      <CardHeader className="border-b border-border bg-ai-subtle/40 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ai-subtle shadow-sm ring-1 ring-ai/10">
              <Sparkles className="h-4 w-4 text-ai" aria-hidden />
            </span>
            <CardTitle className="text-base font-semibold">AI Activity</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-ai/10 hover:text-ai transition-colors">
            <Link href="/dashboard/ai">
              Open AI Studio
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-5">

        {/* Detailed Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-md bg-surface-sunken/50 p-2 border border-border/50">
            <p className="text-xl font-display font-semibold">{pollsGen}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">Polls</p>
          </div>
          <div className="rounded-md bg-surface-sunken/50 p-2 border border-border/50">
            <p className="text-xl font-display font-semibold">{quizGen}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">Quizzes</p>
          </div>
          <div className="rounded-md bg-surface-sunken/50 p-2 border border-border/50">
            <p className="text-xl font-display font-semibold">{surveyGen}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">Surveys</p>
          </div>
          <div className="rounded-md bg-surface-sunken/50 p-2 border border-border/50">
            <p className="text-xl font-display font-semibold">{feedbackGen}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">Feedback</p>
          </div>
          <div className="rounded-md bg-surface-sunken/50 p-2 border border-border/50">
            <p className="text-xl font-display font-semibold">{cloudGen}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">Clouds</p>
          </div>
        </div>

        {/* Last Action */}
        <div className="rounded-md border border-ai/10 bg-ai-subtle/30 px-3 py-2.5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ai/80">
            Recent AI Action
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {lastAI ? lastAI.title : 'None yet'}
          </p>
        </div>

        {/* Quick generate buttons */}
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-muted">Quick Generate</p>
          <div className="grid grid-cols-4 gap-2">
            {quickGenActions.map(({ icon: Icon, label, href }) => (
              <Button key={label} asChild variant="outline" size="sm" className="justify-center gap-1.5 h-8 text-xs hover:border-ai/50 hover:bg-ai/5 transition-all">
                <Link href={href}>
                  <Icon className="h-3 w-3 text-ai" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section: Session Summary
// ---------------------------------------------------------------------------

function SessionSummaryPanel({ events }: { events: Event[] | undefined }) {
  const ended = events?.filter((e) => e.status === 'ended') ?? [];
  const mostActive = events?.reduce(
    (best: Event | null, e: Event) =>
      !best ? e : e.updatedAt > best.updatedAt ? e : best,
    null,
  );

  const hasData = ended.length > 0;

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Session Summary</CardTitle>
          <Clock className="h-4 w-4 text-ink-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {hasData ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-ink-secondary">Completed sessions</span>
              <span className="text-sm font-semibold text-foreground">{ended.length}</span>
            </div>
            {mostActive && (
              <div className="rounded-md border border-border bg-surface-sunken px-3 py-2.5 transition-colors hover:border-brand/40">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
                  Most active event
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                  {mostActive.name}
                </p>
                <StatusBadge status={mostActive.status} size="sm" className="mt-2" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunken">
              <BarChart3 className="h-5 w-5 text-ink-muted" />
            </div>
            <p className="text-sm font-medium text-foreground">No completed analytics yet.</p>
            <p className="text-xs text-ink-secondary px-2">Complete your first event to unlock session insights and analytics.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state (no events at all)
// ---------------------------------------------------------------------------

function WorkspaceEmptyState() {
  return (
    <EmptyState
      icon={<LayoutDashboard className="h-8 w-8 text-brand" />}
      title="Welcome to Pulse"
      description="Create your first event to start engaging your audience with live polls, quizzes, surveys, word clouds, and Q&amp;A — all in real time."
      className="py-16"
      action={
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              Create your first event
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/ai">
              <Sparkles className="h-4 w-4 text-ai" />
              Open AI Studio
            </Link>
          </Button>
        </div>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DashboardOverviewPage() {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { notifications } = useNotifications();
  const { user } = useAuth();
  
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const today = formatDate(new Date());

  const hasEvents = !eventsLoading && (events?.length ?? 0) > 0;
  const recentEvents = events?.slice().sort((a, b) =>
    String(b.updatedAt) > String(a.updatedAt) ? 1 : -1
  ).slice(0, 5);
  const draftEvent = events?.find(e => e.status === 'draft');

  const quickActions: QuickAction[] = [
    {
      id: 'create-event',
      icon: Plus,
      label: 'Create Event',
      description: 'Start a new interactive session',
      color: 'bg-brand-subtle',
      iconColor: 'text-brand',
      href: '/dashboard/events/new',
    },
    {
      id: 'generate-poll',
      icon: RadioTower,
      label: 'Generate Poll',
      description: 'AI-assisted poll creation',
      color: 'bg-ai-subtle',
      iconColor: 'text-ai',
      href: '/dashboard/ai',
    },
    {
      id: 'generate-quiz',
      icon: BrainCircuit,
      label: 'Generate Quiz',
      description: 'Build a trivia game instantly',
      color: 'bg-ai-subtle',
      iconColor: 'text-ai',
      href: '/dashboard/ai',
    },
    {
      id: 'generate-survey',
      icon: ClipboardList,
      label: 'Generate Survey',
      description: 'Multi-step questionnaires',
      color: 'bg-ai-subtle',
      iconColor: 'text-ai',
      href: '/dashboard/ai',
    },
    {
      id: 'generate-feedback',
      icon: MessageSquareDashed,
      label: 'Generate Feedback',
      description: 'Automated feedback forms',
      color: 'bg-ai-subtle',
      iconColor: 'text-ai',
      href: '/dashboard/ai',
    },
    {
      id: 'generate-wordcloud',
      icon: Cloud,
      label: 'Generate Word Cloud',
      description: 'Crowdsource ideas quickly',
      color: 'bg-ai-subtle',
      iconColor: 'text-ai',
      href: '/dashboard/ai',
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notification Center',
      description: 'View updates and alerts',
      color: 'bg-surface-sunken',
      iconColor: 'text-ink-secondary',
      onClick: requestOpenNotificationCenter,
    },
    {
      id: 'command-palette',
      icon: Terminal,
      label: 'Command Palette',
      description: 'Search across workspace',
      color: 'bg-surface-sunken',
      iconColor: 'text-ink-secondary',
      onClick: openCommandPalette,
    },
    ...(draftEvent ? [{
      id: 'continue-draft',
      icon: PlayCircle,
      label: 'Continue Draft',
      description: `Resume '${draftEvent.name}'`,
      color: 'bg-warning-subtle',
      iconColor: 'text-[var(--warning-text)]',
      href: `/dashboard/events/${draftEvent._id}`,
    }] : []),
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-10">
      {/* ── Section 1: Workspace Header ──────────────────────────────────── */}
      <PageHeader
        eyebrow={today}
        title={getGreeting(user)}
        description="Here's what's happening across your workspace today."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="transition-all hover:bg-surface-sunken hover:border-border">
              <Link href="/dashboard/events">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="transition-all hover:bg-ai-subtle hover:text-ai hover:border-ai/30">
              <Link href="/dashboard/ai">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Studio</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="transition-all shadow-sm hover:shadow-md">
              <Link href="/dashboard/events/new">
                <Plus className="h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>
        }
      />

      {/* ── Section 2: Metrics ───────────────────────────────────────────── */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Workspace metrics</h2>
        <WorkspaceMetrics />
      </section>

      {/* ── Empty state (no events) ──────────────────────────────────────── */}
      {!eventsLoading && !hasEvents && <WorkspaceEmptyState />}

      {/* Rest of sections only meaningful when there are events */}
      {(eventsLoading || hasEvents) && (
        <>
          {/* ── Section 3 + 4: Activity + Quick Actions (2-col grid) ──────── */}
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Recent Activity */}
            <section aria-labelledby="activity-heading" className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  id="activity-heading"
                  className="text-base font-semibold text-foreground tracking-tight"
                >
                  Recent Activity
                </h2>
                <button
                  type="button"
                  onClick={requestOpenNotificationCenter}
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                {eventsLoading ? <ListSkeleton count={4} /> : <ActivityTimeline notifications={notifications} />}
              </div>
            </section>

            {/* Quick Actions */}
            <section aria-labelledby="quick-actions-heading" className="flex flex-col">
              <h2
                id="quick-actions-heading"
                className="mb-4 text-base font-semibold text-foreground tracking-tight"
              >
                Productivity Shortcuts
              </h2>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.id} action={action} />
                ))}
              </div>
            </section>
          </div>

          {/* ── Section 5: Recent Events ──────────────────────────────────── */}
          <section aria-labelledby="recent-events-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="recent-events-heading"
                className="text-base font-semibold text-foreground tracking-tight"
              >
                Recent Events
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-ink-secondary hover:text-foreground">
                <Link href="/dashboard/events">
                  See all events
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            {eventsLoading ? (
              <ListSkeleton count={5} />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-surface-card divide-y divide-border shadow-xs">
                {recentEvents?.map((event) => (
                  <RecentEventRow key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* ── Sections 6 + 7: AI Workspace + Session Summary ───────────── */}
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {eventsLoading ? <ChartSkeleton /> : <AIWorkspacePanel notifications={notifications} />}
            {eventsLoading ? <ChartSkeleton /> : <SessionSummaryPanel events={events} />}
          </div>
        </>
      )}

      {/* Keyboard shortcut hint */}
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-ink-faint">
        <Keyboard className="h-3.5 w-3.5" />
        <span>
          Press{' '}
          <kbd className="rounded border border-border bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-secondary shadow-sm">
            Ctrl K
          </kbd>{' '}
          to open the command palette
        </span>
      </div>
    </div>
  );
}
