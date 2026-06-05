'use client';

import { useMemo } from 'react';
import { Check, CheckCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { QaQuestion } from '@/lib/use-event-realtime';

type QuestionModerationPanelProps = {
  pendingQuestions: QaQuestion[];
  approvedQuestions: QaQuestion[];
  answeredQuestions: QaQuestion[];
  onApprove: (questionId: string) => void;
  onDismiss: (questionId: string) => void;
  onMarkAnswered: (questionId: string) => void;
  isUpdating?: boolean;
};

function sortPending(questions: QaQuestion[]) {
  return [...questions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function sortApproved(questions: QaQuestion[]) {
  return [...questions].sort((a, b) => {
    if (b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function sortAnswered(questions: QaQuestion[]) {
  return [...questions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function QuestionMeta({ question }: { question: QaQuestion }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{question.authorName?.trim() || 'Anonymous'}</span>
      <span>•</span>
      <span>
        {question.voteCount} vote{question.voteCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function QuestionModerationPanel({
  pendingQuestions,
  approvedQuestions,
  answeredQuestions,
  onApprove,
  onDismiss,
  onMarkAnswered,
  isUpdating = false,
}: QuestionModerationPanelProps) {
  const pending = useMemo(() => sortPending(pendingQuestions), [pendingQuestions]);
  const approved = useMemo(() => sortApproved(approvedQuestions), [approvedQuestions]);
  const answered = useMemo(() => sortAnswered(answeredQuestions), [answeredQuestions]);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending Questions</CardTitle>
          <CardDescription>Newest questions first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <EmptyState text="No pending questions." />
          ) : (
            pending.map((question) => (
              <article key={question._id} className="rounded-lg border p-4">
                <p className="text-sm font-medium leading-6">{question.text}</p>
                <QuestionMeta question={question} />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(question._id)}
                    disabled={isUpdating}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDismiss(question._id)}
                    disabled={isUpdating}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approved Questions</CardTitle>
          <CardDescription>Highest vote count first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {approved.length === 0 ? (
            <EmptyState text="No approved questions yet." />
          ) : (
            approved.map((question) => (
              <article key={question._id} className="rounded-lg border p-4">
                <p className="text-sm font-medium leading-6">{question.text}</p>
                <QuestionMeta question={question} />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAnswered(question._id)}
                    disabled={isUpdating}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark Answered
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDismiss(question._id)}
                    disabled={isUpdating}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answered Questions</CardTitle>
          <CardDescription>Read-only question history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {answered.length === 0 ? (
            <EmptyState text="No answered questions yet." />
          ) : (
            answered.map((question) => (
              <article key={question._id} className="rounded-lg border p-4">
                <p className="text-sm font-medium leading-6">{question.text}</p>
                <QuestionMeta question={question} />
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}