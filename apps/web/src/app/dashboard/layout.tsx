'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sparkles } from 'lucide-react';
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

  if (pathname === '/dashboard') {
    return (
      <DashboardShell
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Events' },
        ]}
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
          user?.name ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="text-xs text-ink-muted">Signed in</p>
            </div>
          ) : undefined
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
