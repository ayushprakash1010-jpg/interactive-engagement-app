'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/connection-status';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { usePoll } from '@/hooks/use-poll';
import { PollParticipant } from '@/components/poll/poll-participant';
import { PollResultsChart } from '@/components/poll/poll-results-chart';

function getAnonId(): string {
  if (typeof window === 'undefined') return '';

  let anonId = localStorage.getItem('iep_anon_id');
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem('iep_anon_id', anonId);
  }
  return anonId;
}

export default function EventPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { count, error } = useEventRealtime(code, 'participant');
  const anonId = getAnonId();

  const { activeActivity, tallies, hasSubmitted, submitResponse } = usePoll(anonId);

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

  const showWaitingState = !activeActivity;
  const showPollInput =
    activeActivity &&
    activeActivity.type === 'poll' &&
    activeActivity.status === 'live' &&
    !hasSubmitted;

  const showPollResults =
    activeActivity &&
    activeActivity.type === 'poll' &&
    (hasSubmitted || activeActivity.status === 'closed');

  return (
    <main className="flex min-h-screen flex-col p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Event {code}</h1>
        <ConnectionStatus />
      </header>

      <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        {count} {count === 1 ? 'person' : 'people'} connected
      </div>

      {/* Waiting state */}
      {showWaitingState && (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
          <p>Waiting for the host to start an activity…</p>
        </div>
      )}

      {/* Live poll input */}
      {showPollInput && (
        <div className="mt-6 rounded-lg border bg-card p-6">
          <PollParticipant
            activity={activeActivity}
            tallies={tallies}
            hasSubmitted={hasSubmitted}
            onSubmit={submitResponse}
          />
        </div>
      )}

      {/* Results after submit / after close */}
      {showPollResults && (
        <div className="mt-6 space-y-4 rounded-lg border bg-card p-6">
          <div>
            <p className="text-sm font-medium text-primary">
              {activeActivity.status === 'closed'
                ? 'Poll closed'
                : 'Response submitted'}
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              {(activeActivity.config as any)?.question}
            </h2>
          </div>

          {tallies ? (
            <PollResultsChart tallies={tallies} />
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Waiting for results…
            </div>
          )}
        </div>
      )}
    </main>
  );
}