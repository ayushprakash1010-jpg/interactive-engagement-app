'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, RotateCw, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/events-api';
import { notify } from '@/lib/notification-store';
import type { QaQuestion } from '@/lib/use-event-realtime';

type QuestionModerationPanelProps = {
  pendingQuestions: QaQuestion[];
  approvedQuestions: QaQuestion[];
  answeredQuestions: QaQuestion[];
  onApprove: (questionId: string) => void;
  onDismiss: (questionId: string) => void;
  onReply: (questionId: string, answerText: string) => void;
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
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
      <span>{question.authorName?.trim() || 'Anonymous'}</span>
      <span aria-hidden>·</span>
      <span className="font-mono tabular-nums">
        {question.voteCount} vote{question.voteCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-sunken p-6 text-sm text-ink-muted">
      {text}
    </div>
  );
}

function AiReplyDialog({
  question,
  open,
  onOpenChange,
  onUseReply,
}: {
  question: QaQuestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseReply: (questionId: string, answer: string) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateReply(targetQuestion = question) {
    if (!targetQuestion) return;

    setIsGenerating(true);
    setError('');
    setCopied(false);

    try {
      const result = await apiFetch<{ answer?: string }>('ai/generate-qa-reply', {
        method: 'POST',
        body: JSON.stringify({ question: targetQuestion.text }),
      });

      setAnswer(result.answer?.trim() ?? '');
      notify({
        type: 'ai-reply-generated',
        description: 'AI generated a reply successfully.',
        href: window.location.pathname,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI could not generate a reply right now.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyAnswer() {
    if (!answer.trim()) return;

    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
    } catch {
      setError('Could not copy the reply. Please select the text and copy it.');
    }
  }

  useEffect(() => {
    if (!open || !question) return;

    setAnswer('');
    void generateReply(question);
    // Generate only when the host opens a reply for a new question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, question?._id]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setCopied(false);
      setError('');
    }
  }

  function useReply() {
    if (!question || !answer.trim()) return;
    onUseReply(question._id, answer);
    handleOpenChange(false);
  }

  const looksLikeCode = answer.includes('```');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai" />
            AI Reply
          </DialogTitle>
          <DialogDescription>
            Review, edit, or copy this suggested answer. Nothing is published automatically.
          </DialogDescription>
        </DialogHeader>

        {question && (
          <div className="rounded-md border border-border bg-surface-sunken p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Audience question
            </p>
            <p className="mt-1 leading-6 text-foreground">{question.text}</p>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 rounded-md border border-ai-border bg-ai-subtle p-3 text-sm text-ink-secondary">
            <RotateCw className="h-4 w-4 animate-spin text-ai" />
            Generating AI reply...
          </div>
        )}

        {error && (
          <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <p className="text-destructive">{error}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => generateReply()}
              disabled={isGenerating}
            >
              <RotateCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="ai-reply-answer" className="text-sm font-medium text-foreground">
            Suggested answer
          </label>
          <Textarea
            id="ai-reply-answer"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              setCopied(false);
            }}
            placeholder="The generated answer will appear here."
            rows={8}
            disabled={isGenerating && !answer}
            className={`max-h-[45vh] min-h-48 resize-y overflow-y-auto rounded-lg border-border bg-surface-sunken/70 px-4 py-3 text-[0.95rem] leading-7 shadow-inner transition focus-visible:ring-2 focus-visible:ring-ai focus-visible:ring-offset-2 ${
              looksLikeCode ? 'font-mono text-[0.875rem]' : 'font-sans'
            }`}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={copyAnswer}
            disabled={!answer.trim() || isGenerating}
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            type="button"
            onClick={useReply}
            disabled={!question || !answer.trim() || isGenerating}
          >
            Use Reply
          </Button>
          <Button
            type="button"
            variant="ai"
            onClick={() => generateReply()}
            loading={isGenerating}
            disabled={!question}
          >
            <RotateCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuestionModerationPanel({
  pendingQuestions,
  approvedQuestions,
  answeredQuestions,
  onApprove,
  onDismiss,
  onReply,
  isUpdating = false,
}: QuestionModerationPanelProps) {
  const pending = useMemo(() => sortPending(pendingQuestions), [pendingQuestions]);
  const approved = useMemo(() => sortApproved(approvedQuestions), [approvedQuestions]);
  const answered = useMemo(() => sortAnswered(answeredQuestions), [answeredQuestions]);
  const [aiReplyQuestion, setAiReplyQuestion] = useState<QaQuestion | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const replyInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  function openAiReply(question: QaQuestion) {
    setAiReplyQuestion(question);
  }

  function useAiReply(questionId: string, answer: string) {
    setReplyDrafts((current) => ({
      ...current,
      [questionId]: answer,
    }));

    window.setTimeout(() => {
      replyInputRefs.current[questionId]?.focus();
    }, 0);
  }

  function updateReplyDraft(questionId: string, answer: string) {
    setReplyDrafts((current) => ({
      ...current,
      [questionId]: answer,
    }));
  }

  function clearReplyDraft(questionId: string) {
    updateReplyDraft(questionId, '');
    window.setTimeout(() => {
      replyInputRefs.current[questionId]?.focus();
    }, 0);
  }

  function submitReply(questionId: string) {
    const answerText = replyDrafts[questionId]?.trim();
    if (!answerText) return;

    onReply(questionId, answerText);
    setReplyDrafts((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  return (
    <>
      <AiReplyDialog
        question={aiReplyQuestion}
        open={Boolean(aiReplyQuestion)}
        onOpenChange={(open) => {
          if (!open) {
            setAiReplyQuestion(null);
          }
        }}
        onUseReply={useAiReply}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Pending questions</CardTitle>
              <Badge variant="warning">{pending.length}</Badge>
            </div>
            <CardDescription>Newest questions first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 ? (
              <EmptyState text="No pending questions." />
            ) : (
              pending.map((question) => (
                <article
                  key={question._id}
                  className="rounded-lg border border-border bg-surface-card p-4"
                >
                  <p className="text-sm font-medium leading-6">{question.text}</p>
                  <QuestionMeta question={question} />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onApprove(question._id)} disabled={isUpdating}>
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDismiss(question._id)}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
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
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Approved questions</CardTitle>
              <Badge variant="success">{approved.length}</Badge>
            </div>
            <CardDescription>Highest vote count first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approved.length === 0 ? (
              <EmptyState text="No approved questions yet." />
            ) : (
              approved.map((question) => (
                <article
                  key={question._id}
                  className="rounded-lg border border-border bg-surface-card p-4"
                >
                  <p className="text-sm font-medium leading-6">{question.text}</p>
                  <QuestionMeta question={question} />

                  <div className="mt-4 space-y-2">
                    <label
                      htmlFor={`reply-draft-${question._id}`}
                      className="text-xs font-semibold uppercase tracking-wide text-ink-muted"
                    >
                      Host answer draft
                    </label>
                    <Textarea
                      id={`reply-draft-${question._id}`}
                      ref={(node) => {
                        replyInputRefs.current[question._id] = node;
                      }}
                      value={replyDrafts[question._id] ?? ''}
                      onChange={(event) => updateReplyDraft(question._id, event.target.value)}
                      placeholder="Draft an answer for the host to review."
                      rows={3}
                      className="min-h-24 resize-y rounded-lg bg-surface-sunken/60 leading-6"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAiReply(question)}>
                      <Sparkles className="h-4 w-4 text-ai" />
                      AI Reply
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => submitReply(question._id)}
                      disabled={isUpdating || !replyDrafts[question._id]?.trim()}
                    >
                      <Check className="h-4 w-4" />
                      Reply
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearReplyDraft(question._id)}
                      disabled={isUpdating || !replyDrafts[question._id]?.trim()}
                    >
                      Clear
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDismiss(question._id)}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
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
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Answered questions</CardTitle>
              <Badge variant="neutral">{answered.length}</Badge>
            </div>
            <CardDescription>Read-only question history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {answered.length === 0 ? (
              <EmptyState text="No answered questions yet." />
            ) : (
              answered.map((question) => (
                <article
                  key={question._id}
                  className="rounded-lg border border-border bg-surface-sunken p-4"
                >
                  <p className="text-sm font-medium leading-6">{question.text}</p>
                  <QuestionMeta question={question} />
                  {question.answerText?.trim() && (
                    <div className="mt-3 rounded-md border border-border bg-surface-card px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Host reply
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-secondary">
                        {question.answerText}
                      </p>
                    </div>
                  )}
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
