import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/brand/pulse-logomark.svg"
            alt="Pulse"
            width={48}
            height={48}
            priority
            unoptimized
          />
          <div className="space-y-1 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Pulse Admin Console
            </h1>
            <p className="text-sm text-ink-secondary">
              Internal tool — authorised personnel only
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-xl border bg-surface-card p-8 shadow-sm">
          <Link
            href="/api/auth/login"
            className="flex h-11 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign in with Auth0
          </Link>
          <p className="mt-4 text-center text-xs text-ink-muted">
            Access is restricted to Pulse team members with an admin role.
          </p>
        </div>
      </div>
    </div>
  );
}
