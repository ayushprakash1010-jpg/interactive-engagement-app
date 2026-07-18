'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { AdminMe } from '@/lib/admin-api';

interface AdminShellProps {
  children: React.ReactNode;
  user: AdminMe;
  className?: string;
}

/**
 * Admin Console application shell — top nav bar + main content area.
 * Phase 1: lightweight top bar only. Future phases may add a sidebar.
 */
export function AdminShell({ children, user, className }: AdminShellProps) {
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
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="text-xs font-medium text-ink-secondary">
                {user.name}
              </span>
              <Badge variant="brand" size="sm">
                Admin
              </Badge>
            </div>
            <Link
              href="/api/auth/logout"
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-ink-secondary',
                'border border-input bg-surface-card transition-colors hover:bg-surface-raised hover:text-foreground',
              )}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className={cn('flex-1', className)}>{children}</main>
    </div>
  );
}
