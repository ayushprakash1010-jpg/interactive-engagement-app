'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/use-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logoutUrl } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            IEP <span className="text-muted-foreground">Dashboard</span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            {user?.name && (
              <span className="hidden text-muted-foreground sm:inline">
                {user.name}
              </span>
            )}

            <Button asChild variant="outline" size="sm">
              <a href={logoutUrl}>Log out</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}