import Link from 'next/link';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Wordmark } from '@/components/pulse';

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4">
      <div className="mb-8">
        <Wordmark width={120} />
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface-card shadow-lg text-center p-8 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-subtle">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Account Suspended
          </h1>
          <p className="text-ink-secondary leading-relaxed">
            Your account has been suspended. You no longer have access to the dashboard or live events.
            <br />
            Please contact your administrator for more information.
          </p>
        </div>

        <div className="pt-4">
          <a
            href="/api/auth/logout"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
