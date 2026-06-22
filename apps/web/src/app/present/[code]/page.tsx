'use client';

import { useParams } from 'next/navigation';

import { ConnectionStatus } from '@/components/connection-status';
import { ProjectorQaView } from '@/components/projector/projector-qa-view';
import { QuizProjectorView } from '@/components/projector/quiz-projector-view';
import { WordCloudProjectorView } from '@/components/projector/wordcloud-projector-view';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { usePoll } from '@/hooks/use-poll';
import { PollResultsChart } from '@/components/poll/poll-results-chart';
import { JoinCode, LiveDot, Wordmark } from '@/components/pulse';

export default function PresenterPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const { count, error, approvedQuestions } = useEventRealtime(code, 'observe');
  const {
    activeActivity,
    tallies,
    quizQuestion,
    quizLeaderboard,
    wordCloudWords,
  } = usePoll(null);

  if (error) {
    return (
      <main className="pulse-stage flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="font-display text-4xl font-bold text-foreground">
          Can&apos;t show this event
        </h1>
        <p className="text-ink-muted">{error}</p>
      </main>
    );
  }

  const hasQuizState = Boolean(
    (activeActivity && activeActivity.type === 'quiz') ||
      quizQuestion ||
      quizLeaderboard.length > 0,
  );

  const showWaitingState = !activeActivity && !hasQuizState;
  const showPoll = activeActivity && activeActivity.type === 'poll';
  const showQuiz = hasQuizState;
  const showWordCloud = activeActivity && activeActivity.type === 'wordcloud';
  const showQa = approvedQuestions.length > 0;
  const isPollLive = showPoll && activeActivity.status === 'live';

  return (
    <main className="pulse-stage flex min-h-screen flex-col p-10">
      <header className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Wordmark dark width={140} />
          <div className="hidden h-9 w-px bg-border sm:block" />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Join at pulse.app
            </span>
            <JoinCode code={code} size="lg" inverse />
          </div>
        </div>
        <ConnectionStatus />
      </header>

      <div className="flex flex-1 flex-col gap-10 pt-10">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-1.5">
            <LiveDot />
            <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
              Live now
            </span>
          </div>
          <p className="font-display text-7xl font-bold tabular-nums text-foreground">
            {count}
          </p>
          <p className="mt-2 text-xl text-ink-muted">
            {count === 1 ? 'participant' : 'participants'} joined
          </p>
        </div>

        {showWaitingState && !showQa && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-lg text-ink-muted">Waiting for the host…</p>
          </div>
        )}

        {showPoll && (
          <section className="mx-auto w-full max-w-5xl space-y-6 text-left">
            <div className="space-y-3 text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
                {isPollLive && <LiveDot />}
                {isPollLive ? 'Live poll' : 'Poll closed'}
              </p>
              <h1 className="font-display text-5xl font-bold tracking-tight text-foreground">
                {(activeActivity.config as { question?: string })?.question}
              </h1>
            </div>

            {tallies ? (
              <div className="rounded-2xl border border-border bg-surface-card p-8">
                <PollResultsChart tallies={tallies} projector inverse />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-lg text-ink-muted">
                Waiting for responses…
              </div>
            )}
          </section>
        )}

        {showQuiz && (
          <section className="mx-auto w-full max-w-7xl">
            <QuizProjectorView
              question={quizQuestion}
              leaderboard={quizLeaderboard}
            />
          </section>
        )}

        {showWordCloud && activeActivity && (
          <section className="mx-auto w-full max-w-7xl">
            <WordCloudProjectorView
              title={activeActivity.title}
              prompt={activeActivity.config.prompt ?? activeActivity.config.question}
              words={wordCloudWords}
            />
          </section>
        )}

        <section className="mx-auto w-full">
          <ProjectorQaView questions={approvedQuestions} />
        </section>
      </div>
    </main>
  );
}
