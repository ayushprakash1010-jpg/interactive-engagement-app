'use client';

import { useParams } from 'next/navigation';

import { ConnectionStatus } from '@/components/connection-status';
import { ProjectorQaView } from '@/components/projector/projector-qa-view';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { usePoll } from '@/hooks/use-poll';
import { PollResultsChart } from '@/components/poll/poll-results-chart';

export default function PresenterPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { count, error, approvedQuestions } = useEventRealtime(code, 'observe');
  const { activeActivity, tallies } = usePoll(null);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-3xl font-bold">Can&apos;t show this event</h1>
        <p className="text-muted-foreground">{error}</p>
      </main>
    );
  }

  const showWaitingState = !activeActivity;
  const showPoll = activeActivity && activeActivity.type === 'poll';
  const showQa = approvedQuestions.length > 0;

  return (
    <main className="flex min-h-screen flex-col p-10">
      <header className="flex items-center justify-between">
        <span className="font-mono text-2xl font-bold tracking-[0.3em]">
          {code}
        </span>
        <ConnectionStatus />
      </header>

      <div className="flex flex-1 flex-col gap-10 pt-10">
        <div className="text-center">
          <p className="text-8xl font-bold tabular-nums">{count}</p>
          <p className="mt-2 text-xl text-muted-foreground">
            {count === 1 ? 'participant' : 'participants'} joined
          </p>
        </div>

        {showWaitingState && !showQa && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-lg text-muted-foreground">Waiting for the host…</p>
          </div>
        )}

        {showPoll && (
          <section className="mx-auto w-full max-w-5xl space-y-6 text-left">
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {activeActivity.status === 'live' ? 'Live poll' : 'Poll closed'}
              </p>
              <h1 className="text-4xl font-bold tracking-tight">
                {(activeActivity.config as any)?.question}
              </h1>
            </div>

            {tallies ? (
              <div className="rounded-xl border bg-card p-8 shadow-sm">
                <PollResultsChart tallies={tallies} projector />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-12 text-center text-lg text-muted-foreground">
                Waiting for responses…
              </div>
            )}
          </section>
        )}

        <section className="mx-auto w-full">
          <ProjectorQaView questions={approvedQuestions} />
        </section>
      </div>
    </main>
  );
}