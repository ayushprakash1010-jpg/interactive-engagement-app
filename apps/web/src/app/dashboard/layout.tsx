'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  PlayCircle,
  Terminal,
  RadioTower,
  Puzzle,
  Presentation,
  Video,
  MessageSquare,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/layout';
import { NotificationCenter } from '@/components/notifications';
import { ThemeToggle } from '@/components/theme-toggle';
import { Wordmark, AIBadge } from '@/components/pulse';
import {
  PowerPointIcon,
  GoogleSlidesIcon,
  ZoomIcon,
  GoogleMeetIcon,
  TeamsIcon,
} from '@/components/brand-icons';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/use-auth';
import { useEvents } from '@/lib/use-events';
import { useGlobalEventScheduler } from '@/lib/use-global-event-scheduler';
import { openCommandPalette } from '@/lib/command-palette-store';
import { CommandPalette } from '@/components/command-palette';
import { FeatureFlagsProvider, useFeatureFlags } from '@/lib/use-feature-flags';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Events', icon: LayoutDashboard, exact: true },
];

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureFlagsProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </FeatureFlagsProvider>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logoutUrl } = useAuth();
  const { flags } = useFeatureFlags();
  const pathname = usePathname();
  const { data: events } = useEvents();
  useGlobalEventScheduler();

  const draftEvent = events?.find((e) => e.status === 'draft');

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const eventDetailMatch = pathname.match(/^\/dashboard\/events\/([^/]+)$/);
  const analyticsMatch = pathname.match(/^\/dashboard\/events\/([^/]+)\/analytics$/);
  const isAccountPage = pathname === '/dashboard/account';
  const isAIStudioPage = pathname === '/dashboard/ai';
  const isSettingsPage = pathname === '/dashboard/settings';
  const isHelpPage = pathname === '/dashboard/help';
  const isOverviewPage = pathname === '/dashboard';
  const isEventsListPage = pathname === '/dashboard/events';

  // Pages that use the DashboardShell sidebar layout
  if (
    isOverviewPage ||
    isEventsListPage ||
    isAccountPage ||
    isAIStudioPage ||
    isSettingsPage ||
    isHelpPage ||
    eventDetailMatch ||
    analyticsMatch
  ) {
    const eventId = eventDetailMatch?.[1] ?? analyticsMatch?.[1];

    // Build breadcrumbs for each route
    const breadcrumbs = analyticsMatch
      ? [
        { label: 'Workspace', href: '/dashboard' },
        { label: 'Events', href: '/dashboard/events' },
        { label: 'Event detail', href: `/dashboard/events/${eventId}` },
        { label: 'Analytics' },
      ]
      : eventDetailMatch
        ? [
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Events', href: '/dashboard/events' },
          { label: 'Event detail' },
        ]
        : isEventsListPage
          ? [
            { label: 'Workspace', href: '/dashboard' },
            { label: 'Events' },
          ]
          : isAccountPage
            ? [
              { label: 'Workspace', href: '/dashboard' },
              { label: 'Account' },
            ]
            : isAIStudioPage
              ? [
                { label: 'Workspace', href: '/dashboard' },
                { label: 'AI Studio' },
              ]
              : isSettingsPage
                ? [
                  { label: 'Workspace', href: '/dashboard' },
                  { label: 'Settings' },
                ]
                : isHelpPage
                  ? [
                    { label: 'Workspace', href: '/dashboard' },
                    { label: 'Help Center' },
                  ]
                  : [{ label: 'Overview' }];

    const displayName = user?.nickname || user?.name?.split('@')[0] || 'User';
    const displayInitial = displayName?.[0]?.toUpperCase() || 'U';

    return (
      <DashboardShell
        analyticsHref={eventId ? `/dashboard/events/${eventId}/analytics` : undefined}
        breadcrumbs={breadcrumbs}
        helpHref="/dashboard/help"
        navItems={[
          {
            label: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: 'Events',
            href: '/dashboard/events',
            icon: CalendarDays,
          },
          ...(flags['ai-studio'] ? [{
            label: 'AI Studio',
            href: '/dashboard/ai',
            icon: Sparkles,
            badge: <AIBadge label="New" size="sm" />,
          }] : []),
          {
            label: 'Analytics',
            href: eventId ? `/dashboard/events/${eventId}/analytics` : undefined,
            icon: BarChart3,
            disabled: !eventId,
          },
          {
            label: 'Integrations',
            icon: Puzzle,
            children: [
              { label: 'PowerPoint', href: '/dashboard/integrations/powerpoint', icon: PowerPointIcon },
              { label: 'Google Slides', href: '/dashboard/integrations/google-slides', icon: GoogleSlidesIcon },
              { label: 'Zoom', href: '/dashboard/integrations/zoom', icon: ZoomIcon },
              { label: 'Google Meet', href: '/dashboard/integrations/google-meet', icon: GoogleMeetIcon },
              { label: 'Teams', href: '/dashboard/integrations/teams', icon: TeamsIcon },
            ]
          },
          {
            label: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
          },
          {
            label: 'Help',
            href: '/dashboard/help',
            icon: HelpCircle,
          },
        ]}
        topActions={
          <div className="flex items-center gap-1.5 sm:gap-3">
            <NotificationCenter />
            <ThemeToggle />
            <div className="h-4 w-px bg-border mx-1 hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-3">
              {user ? (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand text-xs font-semibold uppercase ring-1 ring-brand/20 shadow-sm"
                  title={displayName}
                >
                  {displayInitial}
                </div>
              ) : null}
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex transition-all hover:bg-surface-sunken">
                <a href={logoutUrl}>Log out</a>
              </Button>
            </div>
          </div>
        }
        sidebarFooter={
          <div className="space-y-1">
            <Link
              href="/dashboard/account"
              className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken"
            >
              <CircleUserRound className="h-5 w-5 shrink-0 text-ink-muted" />
              <span className="truncate">Account</span>
            </Link>
            <a
              href={logoutUrl}
              className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken hover:text-destructive group"
            >
              <LogOut className="h-5 w-5 shrink-0 text-ink-muted group-hover:text-destructive" />
              <span className="truncate">Sign out</span>
            </a>
          </div>
        }
      >
        {children}
        <CommandPalette />
      </DashboardShell>
    );
  }

  // Fallback layout (for any remaining sub-routes not caught above)
  const displayNameFallback = user?.nickname || user?.name?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-surface-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface-card/90 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" aria-label="Pulse dashboard">
              <Wordmark width={104} />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-subtle text-brand-subtle-text'
                        : 'text-ink-secondary hover:bg-surface-sunken hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {flags['ai-studio'] && (
                <Link
                  href="/dashboard/ai"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive('/dashboard/ai')
                      ? 'bg-ai-subtle text-ai-subtle-text'
                      : 'text-ink-secondary hover:bg-surface-sunken hover:text-foreground',
                  )}
                >
                  <Sparkles className="h-4 w-4 text-ai" />
                  AI Studio
                  <AIBadge label="New" size="sm" />
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {user && (
              <span className="hidden text-ink-muted sm:inline font-medium">{displayNameFallback}</span>
            )}
            <NotificationCenter />
            <ThemeToggle />

            <Button asChild variant="outline" size="sm">
              <a href={logoutUrl}>Log out</a>
            </Button>
          </div>
        </div>

        <nav className="flex items-center gap-1 border-t border-border px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-subtle text-brand-subtle-text'
                    : 'text-ink-secondary hover:bg-surface-sunken hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {flags['ai-studio'] && (
            <Link
              href="/dashboard/ai"
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive('/dashboard/ai')
                  ? 'bg-ai-subtle text-ai-subtle-text'
                  : 'text-ink-secondary hover:bg-surface-sunken hover:text-foreground',
              )}
            >
              <Sparkles className="h-4 w-4 text-ai" />
              AI Studio
            </Link>
          )}
        </nav>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">{children}</main>
      <CommandPalette />
    </div>
  );
}
