'use client';

import { LiveDot } from '@/components/pulse';
import { EmptyState, SurfacePanel } from '@/components/ui';
import type { QaQuestion } from '@/lib/use-event-realtime';

type ProjectorQaViewProps = {
  questions: QaQuestion[];
};

export function ProjectorQaView({ questions }: ProjectorQaViewProps) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-1.5">
          <LiveDot live={questions.length > 0} />
          <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            Live Q&amp;A
          </span>
        </div>
        <h2 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Approved questions
        </h2>
        <p className="text-lg text-ink-muted sm:text-xl">
          Questions automatically reorder as votes update.
        </p>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          title="No approved questions yet"
          description="Approved audience questions will appear here for the room."
          className="border-border bg-surface-card/80 py-16"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {questions.map((question) => (
            <SurfacePanel
              key={question._id}
              className="border-border bg-surface-card/85 p-6 shadow-xs sm:p-7"
            >
              <div className="flex h-full items-start justify-between gap-6">
                <div className="min-w-0 flex-1 space-y-3 text-left">
                  <p className="text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
                    {question.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-base text-ink-muted">
                    <span>{question.authorName?.trim() || 'Anonymous'}</span>
                    {question.status === 'answered' && (
                      <span className="rounded-full border border-border bg-surface-raised px-3 py-1 text-sm font-semibold text-ink-secondary">
                        Answered
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 rounded-lg border border-border bg-surface-sunken px-5 py-4 text-center">
                  <p className="text-4xl font-bold tabular-nums text-foreground">
                    {question.voteCount}
                  </p>
                  <p className="text-sm text-ink-muted">
                    vote{question.voteCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </SurfacePanel>
          ))}
        </div>
      )}
    </div>
  );
}
