'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/connection-status';
import { useEventRealtime } from '@/lib/use-event-realtime';

export default function EventPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { count, error } = useEventRealtime(code, 'participant');

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Can&apos;t join this event</h1>
        <p className="max-w-sm text-muted-foreground">{error}</p>
        <Button asChild>
          <Link href="/join">Try another code</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Event {code}</h1>
        <ConnectionStatus />
      </header>

      <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        {count} {count === 1 ? 'person' : 'people'} connected
      </div>

      {/* Placeholder activity grid — live activities arrive in Sprint 3+. */}
      <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
        <p>Waiting for the host to start an activity…</p>
      </div>
    </main>
  );
}
