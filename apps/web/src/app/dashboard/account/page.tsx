'use client';

import { LogOut, Mail, UserRound } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  SurfacePanel,
} from '@/components/ui';
import { useAuth } from '@/lib/use-auth';

export default function AccountPage() {
  const { user, logoutUrl } = useAuth();
  const displayName = user?.name ?? user?.email ?? 'Your account';
  const email = user?.email ?? 'No email available';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Account"
        title="Account settings"
        description="View your signed-in profile and manage your session."
        actions={
          <Button asChild variant="outline">
            <a href={logoutUrl}>
              <LogOut className="h-4 w-4" />
              Sign out
            </a>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            Your profile is provided by the authentication provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-display text-lg font-bold text-brand">
              {initials || <UserRound className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-sm text-ink-muted">{email}</p>
            </div>
          </div>

          <SurfacePanel tone="sunken" className="flex items-center gap-3 p-4">
            <Mail className="h-4 w-4 shrink-0 text-ink-muted" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Email
              </p>
              <p className="truncate text-sm text-foreground">{email}</p>
            </div>
          </SurfacePanel>
        </CardContent>
      </Card>
    </div>
  );
}
