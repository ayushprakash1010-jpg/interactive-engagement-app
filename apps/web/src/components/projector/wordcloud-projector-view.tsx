'use client';

import { useMemo } from 'react';
import { WordCloud } from '@/components/wordcloud/wordcloud-cloud';
import { LiveDot } from '@/components/pulse';
import { EmptyState, SurfacePanel } from '@/components/ui';
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
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
      <SurfacePanel className="border-border bg-surface-card/85 p-6 shadow-xs backdrop-blur sm:p-8 lg:p-10">
        <div className="space-y-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-1.5">
            <LiveDot live={words.length > 0} />
            <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
              Live word cloud
            </span>
          </div>

          <h1 className="mx-auto max-w-5xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            {prompt || title || 'Audience responses'}
          </h1>

          <WordCloud
            words={words}
            height={560}
            className="mt-4"
            emptyMessage="Waiting for the first word…"
          />
        </div>
      </SurfacePanel>

      <SurfacePanel className="border-border bg-surface-card/85 p-6 shadow-xs backdrop-blur sm:p-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-surface-raised px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            Live stats
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Word activity
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <SurfacePanel tone="sunken" className="p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Unique words
            </p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-foreground">
              {words.length}
            </p>
          </SurfacePanel>

          <SurfacePanel tone="sunken" className="p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Total mentions
            </p>
            <p className="mt-2 font-display text-5xl font-bold tabular-nums text-brand">
              {totalMentions}
            </p>
          </SurfacePanel>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Top words
          </p>

          {words.length === 0 ? (
            <EmptyState
              title="Top words will appear live"
              description="Audience words rank here as participants respond."
              className="border-border bg-surface-sunken/80 py-10"
            />
          ) : (
            <ol className="space-y-3">
              {words.slice(0, 8).map((word, index) => (
                <li
                  key={word.text}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-sunken px-5 py-4"
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
      </SurfacePanel>
    </div>
  );
}
