'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/use-auth';
import { Logomark } from '@/components/pulse';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/dashboard';

  // Already signed in → skip the login screen.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isLoading, isAuthenticated, returnTo, router]);

  const loginHref = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-12">
      <Logomark size={44} />
      <Card className="w-full rounded-xl shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to create events and run live sessions. Your audience joins without an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild size="lg" loading={isLoading}>
            <a href={loginHref}>Continue with Auth0</a>
          </Button>
          <p className="text-center text-xs text-ink-muted">
            Email/password and Google are supported via Auth0 Universal Login.
          </p>
          <p className="mt-2 text-center text-sm text-ink-muted">
            New here?{' '}
            <a
              href={`/api/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-medium text-brand hover:underline"
            >
              Start here
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
