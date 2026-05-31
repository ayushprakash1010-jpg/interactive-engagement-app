import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_URL, fetchHealth } from '@/lib/api';

// Server component: fetch the API health on each request.
export const dynamic = 'force-dynamic';

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ' +
        (ok
          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300')
      }
    >
      <span
        className={'h-2 w-2 rounded-full ' + (ok ? 'bg-green-500' : 'bg-red-500')}
        aria-hidden
      />
      {label}
    </span>
  );
}

export default async function HomePage() {
  const health = await fetchHealth();

  return (
    <main className="container mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Interactive Engagement Platform</h1>
        <p className="mt-2 text-muted-foreground">
          Real-time polling, Q&amp;A, quizzes, word clouds, and feedback.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">API health</CardTitle>
            <StatusBadge ok={health.ok} label={health.ok ? 'Healthy' : health.status} />
          </div>
          <CardDescription>
            Server-side check of <code className="font-mono">{API_URL}/health</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {health.details ? (
            Object.entries(health.details).map(([name, info]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="font-medium capitalize">{name}</span>
                <StatusBadge ok={info.status === 'up'} label={info.status} />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              {health.error
                ? `Could not reach the API: ${health.error}`
                : 'No dependency details reported.'}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
