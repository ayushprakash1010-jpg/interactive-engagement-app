'use client';

import { useEffect, useMemo, useState } from 'react';
import { LeaderboardRow, LiveDot } from '@/components/pulse';
import { Badge } from '@/components/ui/badge';
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
    <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
      <section className="rounded-3xl border border-border bg-surface-card p-10">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
            <LiveDot live={!isExpired} />
            Live quiz
          </p>

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

          {question ? (
            <>
              <h1 className="font-display text-5xl font-bold tracking-tight leading-tight text-foreground">
                {question.text}
              </h1>

              <div className="grid gap-4 pt-4 md:grid-cols-2">
                {question.options.map((option, index) => (
                  <article
                    key={option.id}
                    className="rounded-2xl border border-border bg-surface-sunken px-6 py-5 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${OPTION_COLORS[index % OPTION_COLORS.length]}`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>

                      <p className="text-2xl font-semibold leading-snug text-foreground">
                        {option.label}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center text-xl text-ink-muted">
              Waiting for the next quiz question…
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-border bg-surface-card p-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Leaderboard
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Top scores
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-lg text-ink-muted">
            Scores will appear after the first question closes.
          </div>
        ) : (
          <ol className="mt-6 space-y-3">
            {leaderboard.map((entry, index) => (
              <li key={`${entry.name}-${index}`}>
                <LeaderboardRow
                  rank={index + 1}
                  name={entry.name}
                  points={entry.points}
                  inverse
                />
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
