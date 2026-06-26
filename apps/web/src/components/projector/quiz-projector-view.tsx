'use client';

import { useEffect, useMemo, useState } from 'react';
import { LeaderboardRow, LiveDot } from '@/components/pulse';
import { Badge } from '@/components/ui/badge';
import { EmptyState, SurfacePanel } from '@/components/ui';
import type { QuizQuestionState, QuizLeaderboardEntry } from '@/hooks/use-poll';

const OPTION_COLORS = [
  'bg-data-1',
  'bg-data-2',
  'bg-data-3',
  'bg-data-4',
  'bg-data-5',
  'bg-data-6',
  'bg-data-7',
  'bg-data-8',
];

type QuizProjectorViewProps = {
  question: QuizQuestionState | null;
  leaderboard: QuizLeaderboardEntry[];
};

export function QuizProjectorView({
  question,
  leaderboard,
}: QuizProjectorViewProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!question?.endsAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [question?.endsAt]);

  const remainingMs = question
    ? Math.max(0, new Date(question.endsAt).getTime() - now)
    : 0;

  const remainingSec = Math.ceil(remainingMs / 1000);
  const isExpired = remainingMs <= 0;

  const timerLabel = useMemo(() => {
    if (!question) return 'Waiting for question';
    if (isExpired) return 'Time up';
    if (remainingSec === 1) return '1 second left';
    return `${remainingSec} seconds left`;
  }, [question, isExpired, remainingSec]);

  return (
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
      <SurfacePanel className="border-border bg-surface-card/85 p-6 shadow-xs backdrop-blur sm:p-8 lg:p-10">
        <div className="space-y-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-1.5">
              <LiveDot live={!isExpired} />
              <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
                Live quiz
              </span>
            </div>

            {question && (
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface-sunken px-4 py-1.5">
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {Math.max(0, remainingSec)}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                  seconds
                </span>
              </div>
            )}
          </div>

          {question ? (
            <>
              <div className="flex items-center justify-center">
                {isExpired ? (
                  <Badge variant="destructive" size="md" className="text-base">
                    {timerLabel}
                  </Badge>
                ) : (
                  <Badge variant="brand" size="md" className="text-base">
                    {timerLabel}
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {question.text}
              </h1>

              <div className="grid gap-4 pt-2 md:grid-cols-2">
                {question.options.map((option, index) => (
                  <article
                    key={option.id}
                    className="rounded-lg border border-border bg-surface-sunken px-5 py-5 text-left shadow-xs sm:px-6"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${OPTION_COLORS[index % OPTION_COLORS.length]}`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>

                      <p className="text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
                        {option.label}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Waiting for the next quiz question"
              description="The question and countdown will appear here as soon as the host advances."
              className="border-border bg-surface-sunken/80 py-16"
            />
          )}
        </div>
      </SurfacePanel>

      <SurfacePanel className="border-border bg-surface-card/85 p-6 shadow-xs backdrop-blur sm:p-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-surface-raised px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            Leaderboard
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Top scores
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <EmptyState
            title="Scores are warming up"
            description="The leaderboard appears after the first question closes."
            className="mt-6 border-border bg-surface-sunken/80 py-12"
          />
        ) : (
          <ol className="mt-6 space-y-3">
            {leaderboard.map((entry, index) => (
              <li key={`${entry.name}-${index}`}>
                <LeaderboardRow
                  rank={index + 1}
                  name={entry.name}
                  points={entry.points}
                  inverse
                  className={
                    index === 0
                      ? 'border-brand/50 bg-brand-subtle px-4 py-4'
                      : 'px-4 py-3'
                  }
                />
              </li>
            ))}
          </ol>
        )}
      </SurfacePanel>
    </div>
  );
}
