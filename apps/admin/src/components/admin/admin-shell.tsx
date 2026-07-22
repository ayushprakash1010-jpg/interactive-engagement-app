'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { AdminMe } from '@/lib/admin-api';
import { CopilotPanel, type CopilotPanelProps } from '@/components/admin/copilot-panel';


interface AdminShellProps {
  children: React.ReactNode;
  user: AdminMe;
  className?: string;
  pageContext?: CopilotPanelProps['pageContext'];
}

/**
 * Admin Console application shell — top nav bar + main content area.
 * Phase 1: lightweight top bar only. Future phases may add a sidebar.
 */
export function AdminShell({ children, user, className, pageContext }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-40 border-b bg-surface-card shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
          {/* Brand */}
          <Link href="/home" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/brand/pulse-logomark.svg"
              alt="Pulse"
              width={28}
              height={28}
              unoptimized
            />
            <span className="font-display text-sm font-bold tracking-tight text-foreground">
              Admin Console
            </span>
          </Link>

          {/* User + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {/* Admin Badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-2.5 py-1 text-xs font-semibold text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
                Admin
              </div>
              
              {/* User Info */}
              <div className="flex flex-col items-end justify-center">
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-ink-secondary leading-tight mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>

            <Link
              href="/api/auth/logout"
              className={cn(
                'flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-ink-secondary',
                'border border-input bg-surface-card transition-colors hover:bg-surface-raised hover:text-foreground',
              )}
              title="Log out"
            >
              <span className="hidden sm:inline">Log out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className={cn('flex-1', className)}>{children}</main>

      {/* AI Copilot — globally available on every admin page */}
      <CopilotPanel user={user} pageContext={pageContext} />
    </div>
  );
}
