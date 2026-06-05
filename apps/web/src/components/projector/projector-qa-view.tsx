'use client';

import type { QaQuestion } from '@/lib/use-event-realtime';

type ProjectorQaViewProps = {
  questions: QaQuestion[];
};

export function ProjectorQaView({ questions }: ProjectorQaViewProps) {
  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Live Q&amp;A
        </p>
        <h2 className="text-4xl font-bold tracking-tight">Approved questions</h2>
        <p className="text-lg text-muted-foreground">
          Questions automatically reorder as votes update.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-lg text-muted-foreground">
          No approved questions yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <article
              key={question._id}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1 space-y-3 text-left">
                  <p className="text-2xl font-semibold leading-tight">{question.text}</p>

                  <div className="flex flex-wrap items-center gap-3 text-base text-muted-foreground">
                    <span>{question.authorName?.trim() || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl border bg-muted/40 px-5 py-4 text-center">
                  <p className="text-3xl font-bold tabular-nums">{question.voteCount}</p>
                  <p className="text-sm text-muted-foreground">
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