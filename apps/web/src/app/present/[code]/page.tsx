'use client';

import { useParams } from 'next/navigation';

import { ConnectionStatus } from '@/components/connection-status';
import { useEventRealtime } from '@/lib/use-event-realtime';

export default function PresenterPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { count, error } = useEventRealtime(code, 'observe');

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-3xl font-bold">Can&apos;t show this event</h1>
        <p className="text-muted-foreground">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-10">
      <header className="flex items-center justify-between">
        <span className="font-mono text-2xl font-bold tracking-[0.3em]">
          {code}
        </span>
        <ConnectionStatus />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div>
          <p className="text-8xl font-bold tabular-nums">{count}</p>
          <p className="mt-2 text-xl text-muted-foreground">
            {count === 1 ? 'participant' : 'participants'} joined
          </p>
        </div>
        <p className="text-lg text-muted-foreground">Waiting for the host…</p>
      </div>
    </main>
  );
}
