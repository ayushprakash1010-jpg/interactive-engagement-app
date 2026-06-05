'use client';

import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
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
  const [displayName, setDisplayName] = useState('');

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
      <section className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Q&amp;A</h2>
          <p className="text-sm text-muted-foreground">
            Ask a question for the host or upvote approved questions from others.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="question-text" className="text-sm font-medium">
              Question
            </label>
            <textarea
              id="question-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type your question here..."
              className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Display name (optional)
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Anonymous"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={60}
            />
          </div>

          <Button type="submit" disabled={!text.trim()}>
            Submit question
          </Button>
        </form>
      </section>

      <section className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Approved questions</h2>
          <p className="text-sm text-muted-foreground">
            Sorted by votes, then most recent.
          </p>
        </div>

        {sortedQuestions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No approved questions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedQuestions.map((question) => {
              const hasVoted = votedQuestionIds.includes(question._id);

              return (
                <article
                  key={question._id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-6">{question.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{question.authorName?.trim() || 'Anonymous'}</span>
                      <span>•</span>
                      <span>
                        {question.voteCount} vote{question.voteCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
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