'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { MessageCircle, ThumbsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { Textarea } from '@/components/ui/textarea';
import { Eyebrow } from '@/components/pulse';
import type { QaQuestion } from '@/lib/use-event-realtime';

type QaTabProps = {
  questions: QaQuestion[];
  votedQuestionIds: string[];
  // FIX: allowAnonymousQA controls whether author names are shown.
  // When true: all questions render as "Anonymous" and the name field is suppressed.
  // When false: the participant's saved display name is sent and shown.
  allowAnonymousQA: boolean;
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
  allowAnonymousQA,
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
    if (!trimmedText) return;

    onAskQuestion({
      text: trimmedText,
      // When anonymous QA is on, don't send a name at all.
      // The server also enforces this, but suppressing it client-side is cleaner.
      displayName: allowAnonymousQA ? undefined : displayName.trim() || undefined,
    });

    setText('');
  }

  return (
    <div className="mt-6 space-y-6">
      <SurfacePanel className="p-5 sm:p-6">
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
            <Textarea
              id="question-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type your question here..."
              className="min-h-[128px] bg-surface-raised"
              maxLength={300}
            />
          </div>

          {/* FIX: Show a clear notice when anonymous mode is active so participants
              understand their name won't be attached to their question. */}
          {allowAnonymousQA && (
            <p className="text-xs text-ink-muted">
              This event has anonymous Q&amp;A enabled. Your question will appear as{' '}
              <span className="font-semibold text-ink-secondary">Anonymous</span>.
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={!text.trim()}>
            <MessageCircle className="h-4 w-4" />
            Ask a question
          </Button>
        </form>
      </SurfacePanel>

      <SurfacePanel className="p-5 sm:p-6">
        <div className="mb-4">
          <Eyebrow>Approved questions</Eyebrow>
          <p className="mt-1 text-sm text-ink-secondary">Sorted by votes, then most recent.</p>
        </div>

        {sortedQuestions.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-6 w-6" />}
            title="No approved questions yet"
            description="Questions approved by the host will appear here."
          />
        ) : (
          <div className="space-y-3">
            {sortedQuestions.map((question) => {
              const hasVoted = votedQuestionIds.includes(question._id);

              return (
                <article
                  key={question._id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface-raised p-4 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-6 text-foreground">{question.text}</p>
                    {question.status === 'answered' && question.answerText?.trim() && (
                      <div className="mt-3 rounded-md border border-border bg-surface-card px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Host reply
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-secondary">
                          {question.answerText}
                        </p>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      {/* FIX: When allowAnonymousQA is true always show "Anonymous"
                          regardless of what authorName contains. This is a defence-in-depth
                          guard on top of the server already stripping the name. */}
                      <span>
                        {allowAnonymousQA
                          ? 'Anonymous'
                          : question.authorName?.trim() || 'Anonymous'}
                      </span>
                      <Badge
                        variant={
                          question.status === 'answered'
                            ? 'success'
                            : question.voteCount > 0
                              ? 'brand'
                              : 'neutral'
                        }
                      >
                        {question.status === 'answered'
                          ? 'Answered'
                          : `${question.voteCount} vote${question.voteCount === 1 ? '' : 's'}`}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    variant={hasVoted ? 'secondary' : 'outline'}
                    disabled={hasVoted || question.status === 'answered'}
                    onClick={() => onUpvoteQuestion(question._id)}
                    className="shrink-0"
                  >
                    {!hasVoted && question.status !== 'answered' && (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    {question.status === 'answered' ? 'Answered' : hasVoted ? 'Upvoted' : 'Upvote'}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </SurfacePanel>
    </div>
  );
}
