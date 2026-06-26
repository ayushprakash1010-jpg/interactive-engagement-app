'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/layout';
import { Wordmark, AIBadge } from '@/components/pulse';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/use-auth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Events', icon: LayoutDashboard, exact: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logoutUrl } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const eventDetailMatch = pathname.match(/^\/dashboard\/events\/([^/]+)$/);
  const analyticsMatch = pathname.match(/^\/dashboard\/events\/([^/]+)\/analytics$/);
  const isAccountPage = pathname === '/dashboard/account';
  const isAIStudioPage = pathname === '/dashboard/ai';

  if (
    pathname === '/dashboard' ||
    isAccountPage ||
    isAIStudioPage ||
    eventDetailMatch ||
    analyticsMatch
  ) {
    const eventId = eventDetailMatch?.[1] ?? analyticsMatch?.[1];

    return (
      <DashboardShell
        analyticsHref={eventId ? `/dashboard/events/${eventId}/analytics` : undefined}
        breadcrumbs={
          analyticsMatch
            ? [
                { label: 'Workspace', href: '/dashboard' },
                { label: 'Events', href: '/dashboard' },
                { label: 'Event detail', href: `/dashboard/events/${eventId}` },
                { label: 'Analytics' },
              ]
            : eventDetailMatch
            ? [
                { label: 'Workspace', href: '/dashboard' },
                { label: 'Events', href: '/dashboard' },
                { label: 'Event detail' },
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
            : [
                { label: 'Workspace', href: '/dashboard' },
                { label: 'Events' },
              ]
        }
        topActions={
          <>
            {user?.name && (
              <span className="hidden max-w-48 truncate text-sm text-ink-muted sm:inline">
                {user.name}
              </span>
            )}
            <Button asChild variant="outline" size="sm">
              <a href={logoutUrl}>Log out</a>
            </Button>
          </>
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
              className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunken"
            >
              <LogOut className="h-5 w-5 shrink-0 text-ink-muted" />
              <span className="truncate">Sign out</span>
            </a>
          </div>
        }
      >
        {children}
      </DashboardShell>
    );
  }

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
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {user?.name && (
              <span className="hidden text-ink-muted sm:inline">{user.name}</span>
            )}

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
        </nav>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
