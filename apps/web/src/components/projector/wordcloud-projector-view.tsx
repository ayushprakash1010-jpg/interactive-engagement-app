'use client';

import { useMemo } from 'react';
import { WordCloud } from '@/components/wordcloud/wordcloud-cloud';
import { LiveDot } from '@/components/pulse';
import type { WordCloudWord } from '@/lib/wordcloud';

const RANK_COLORS = [
  'bg-data-1',
  'bg-data-2',
  'bg-data-3',
  'bg-data-4',
  'bg-data-5',
  'bg-data-6',
  'bg-data-7',
  'bg-data-8',
];

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
      <section className="rounded-3xl border border-border bg-surface-card p-10">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
            <LiveDot />
            Live word cloud
          </p>

          <h1 className="font-display text-5xl font-bold tracking-tight leading-tight text-foreground">
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

      <aside className="rounded-3xl border border-border bg-surface-card p-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Live stats
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Word activity
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-border bg-surface-sunken px-5 py-6 text-center">
            <p className="text-sm font-medium text-ink-muted">Unique words</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
              {words.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-sunken px-5 py-6 text-center">
            <p className="text-sm font-medium text-ink-muted">Total mentions</p>
            <p className="mt-2 text-4xl font-bold tabular-nums text-brand">
              {totalMentions}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">
            Top words
          </p>

          {words.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-base text-ink-muted">
              Top words will appear as participants respond.
            </div>
          ) : (
            <ol className="space-y-3">
              {words.slice(0, 8).map((word, index) => (
                <li
                  key={word.text}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-sunken px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${RANK_COLORS[index % RANK_COLORS.length]}`}
                    >
                      {index + 1}
                    </div>

                    <p className="truncate text-xl font-semibold text-foreground">
                      {word.text}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-bold tabular-nums text-brand">
                      {word.weight}
                    </p>
                    <p className="text-sm text-ink-muted">
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
