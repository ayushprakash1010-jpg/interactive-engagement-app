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
    <main className="container mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to create events and run live sessions. Participants join
            without an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild size="lg" disabled={isLoading}>
            <a href={loginHref}>Continue with Auth0</a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Email/password and Google are supported via Auth0 Universal Login.
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            New here?{' '}
            <a
              href={`/api/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-medium text-primary hover:underline"
            >
              Start here
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
