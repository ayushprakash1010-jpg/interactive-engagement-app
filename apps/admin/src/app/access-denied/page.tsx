import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldX } from 'lucide-react';

export const metadata: Metadata = { title: 'Access Denied' };

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/brand/pulse-logomark.svg"
            alt="Pulse"
            width={40}
            height={40}
            unoptimized
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-subtle">
            <ShieldX className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Access Denied
            </h1>
            <p className="text-sm text-ink-secondary">
              Your account does not have admin privileges. Contact the Pulse
              team to request access.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/api/auth/logout"
            className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-surface-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-raised"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}
