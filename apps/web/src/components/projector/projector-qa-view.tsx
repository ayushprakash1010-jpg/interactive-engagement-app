'use client';

import { LiveDot } from '@/components/pulse';
import type { QaQuestion } from '@/lib/use-event-realtime';

type ProjectorQaViewProps = {
  questions: QaQuestion[];
};

export function ProjectorQaView({ questions }: ProjectorQaViewProps) {
  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="space-y-2 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand">
          <LiveDot />
          Live Q&amp;A
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Approved questions
        </h2>
        <p className="text-lg text-ink-muted">
          Questions automatically reorder as votes update.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-lg text-ink-muted">
          No approved questions yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <article
              key={question._id}
              className="rounded-2xl border border-border bg-surface-card p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1 space-y-3 text-left">
                  <p className="text-2xl font-semibold leading-tight text-foreground">
                    {question.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-base text-ink-muted">
                    <span>{question.authorName?.trim() || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl border border-border bg-surface-sunken px-5 py-4 text-center">
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {question.voteCount}
                  </p>
                  <p className="text-sm text-ink-muted">
                    vote{question.voteCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
