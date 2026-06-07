'use client';

import { useMemo } from 'react';
import { WordCloud } from '@/components/wordcloud/wordcloud-cloud';
import type { WordCloudWord } from '@/lib/wordcloud';

type WordCloudProjectorViewProps = {
  title?: string;
  prompt?: string;
  words: WordCloudWord[];
};

export function WordCloudProjectorView({
  title,
  prompt,
  words,
}: WordCloudProjectorViewProps) {
  const totalMentions = useMemo(
    () => words.reduce((sum, word) => sum + word.weight, 0),
    [words],
  );

  return (
    <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
      <section className="rounded-3xl border bg-card p-10 shadow-sm">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Live word cloud
          </p>

          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            {prompt || title || 'Audience responses'}
          </h1>

          <WordCloud
            words={words}
            height={520}
            className="mt-6"
            emptyMessage="Waiting for the first word…"
          />
        </div>
      </section>

      <aside className="rounded-3xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Live stats
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Word activity</h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border bg-background px-5 py-6 text-center shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Unique words</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
              {words.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-background px-5 py-6 text-center shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total mentions</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-primary">
              {totalMentions}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Top words
          </p>

          {words.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-base text-muted-foreground">
              Top words will appear as participants respond.
            </div>
          ) : (
            <ol className="space-y-3">
              {words.slice(0, 8).map((word, index) => (
                <li
                  key={word.text}
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
                      {word.text}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-bold tabular-nums text-primary">
                      {word.weight}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      mention{word.weight === 1 ? '' : 's'}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}