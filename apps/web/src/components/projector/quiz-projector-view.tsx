'use client';

import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestionState, QuizLeaderboardEntry } from '@/hooks/use-poll';

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
      <section className="rounded-3xl border bg-card p-10 shadow-sm">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Live quiz
          </p>

          <div className="flex items-center justify-center">
            <div
              className="rounded-full px-5 py-2 text-base font-semibold"
              style={{
                background: isExpired
                  ? 'var(--color-error-highlight)'
                  : 'var(--color-primary-highlight)',
                color: isExpired ? 'var(--color-error)' : 'var(--color-primary)',
              }}
            >
              {timerLabel}
            </div>
          </div>

          {question ? (
            <>
              <h1 className="text-5xl font-bold tracking-tight leading-tight">
                {question.text}
              </h1>

              <div className="grid gap-4 pt-4 md:grid-cols-2">
                {question.options.map((option, index) => (
                  <article
                    key={option.id}
                    className="rounded-2xl border bg-background px-6 py-5 text-left shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold"
                        style={{
                          background: 'var(--color-primary-highlight)',
                          color: 'var(--color-primary)',
                        }}
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
            <div className="rounded-2xl border border-dashed p-16 text-center text-xl text-muted-foreground">
              Waiting for the next quiz question…
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Leaderboard
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Top scores</h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed p-10 text-center text-lg text-muted-foreground">
            Scores will appear after the first question closes.
          </div>
        ) : (
          <ol className="mt-6 space-y-3">
            {leaderboard.map((entry, index) => (
              <li
                key={`${entry.name}-${index}`}
                className="flex items-center justify-between gap-4 rounded-2xl border bg-background px-5 py-4 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold"
                    style={{
                      background:
                        index === 0
                          ? 'var(--color-gold-highlight)'
                          : index === 1
                            ? 'var(--color-surface-offset)'
                            : index === 2
                              ? 'var(--color-orange-highlight)'
                              : 'var(--color-primary-highlight)',
                      color:
                        index === 0
                          ? 'var(--color-gold)'
                          : index === 1
                            ? 'var(--color-text)'
                            : index === 2
                              ? 'var(--color-orange)'
                              : 'var(--color-primary)',
                    }}
                  >
                    {index + 1}
                  </div>

                  <p className="truncate text-xl font-semibold text-foreground">
                    {entry.name}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {entry.points}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    point{entry.points === 1 ? '' : 's'}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}