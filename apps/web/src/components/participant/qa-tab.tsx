'use client';

import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eyebrow } from '@/components/pulse';
import type { QaQuestion } from '@/lib/use-event-realtime';


type QaTabProps = {
  questions: QaQuestion[];
  votedQuestionIds: string[];
  onAskQuestion: (payload: { text: string; displayName?: string }) => void;
  onUpvoteQuestion: (questionId: string) => void;
};

function sortQuestions(questions: QaQuestion[]) {
  return [...questions].sort((a, b) => {
    if (b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function QaTab({
  questions,
  votedQuestionIds,
  onAskQuestion,
  onUpvoteQuestion,
}: QaTabProps) {
  const [text, setText] = useState('');
  const [displayName] = useState(() => {
    if (typeof window === 'undefined') return '';

    return localStorage.getItem('iep-display-name') ?? '';
  });

  const sortedQuestions = useMemo(() => sortQuestions(questions), [questions]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedText) return;

    onAskQuestion({
      text: trimmedText,
      displayName: trimmedDisplayName || undefined,
    });

    setText('');
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-md border border-border bg-surface-card p-5 shadow-xs">
        <div className="mb-4">
          <Eyebrow>Q&amp;A</Eyebrow>
          <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
            Ask a question
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Ask the host anything, or upvote questions from others.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="question-text" className="text-sm font-medium text-ink-secondary">
              Your question
            </label>
            <textarea
              id="question-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type your question here..."
              className="min-h-[120px] w-full rounded-sm border border-input bg-surface-card px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-ink-faint focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={300}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!text.trim()}>
            Ask a question
          </Button>
        </form>
      </section>

      <section className="rounded-md border border-border bg-surface-card p-5 shadow-xs">
        <div className="mb-4">
          <Eyebrow>Approved questions</Eyebrow>
          <p className="mt-1 text-sm text-ink-secondary">
            Sorted by votes, then most recent.
          </p>
        </div>

        {sortedQuestions.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-ink-muted">
            No approved questions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedQuestions.map((question) => {
              const hasVoted = votedQuestionIds.includes(question._id);

              return (
                <article
                  key={question._id}
                  className="flex items-start justify-between gap-4 rounded-md border border-border bg-surface-raised p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-6 text-foreground">
                      {question.text}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span>{question.authorName?.trim() || 'Anonymous'}</span>
                      <Badge variant={question.voteCount > 0 ? 'brand' : 'neutral'}>
                        {question.voteCount} vote{question.voteCount === 1 ? '' : 's'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    variant={hasVoted ? 'secondary' : 'outline'}
                    disabled={hasVoted}
                    onClick={() => onUpvoteQuestion(question._id)}
                    className="shrink-0"
                  >
                    {hasVoted ? 'Upvoted' : 'Upvote'}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
