'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type {
  QuizLeaderboardEntry,
  QuizQuestionState,
  UsePollReturn,
} from '../../hooks/use-poll';

interface Props {
  question: QuizQuestionState;
  hasAnswered: boolean;
  answerState: UsePollReturn['quizAnswerState'];
  quizLeaderboard: QuizLeaderboardEntry[];
  onAnswer: UsePollReturn['submitQuizAnswer'];
}

export function QuizParticipant({
  question,
  hasAnswered,
  answerState,
  quizLeaderboard,
  onAnswer,
}: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNow(Date.now());
  }, [question.questionId, question.endsAt]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  const endTime = Number(question.endsAt);
  const remainingMs = Number.isFinite(endTime) ? Math.max(0, endTime - now) : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const isExpired = remainingMs <= 0;

  const selectedOptionId =
    answerState?.questionId === question.questionId
      ? (answerState.selectedOptionId ?? null)
      : null;

  const hasResultForThisQuestion =
    answerState?.questionId === question.questionId &&
    typeof answerState?.isCorrect === 'boolean';

  const hasSubmittedThisQuestion =
    hasAnswered && answerState?.questionId === question.questionId;

  const isLocked = hasSubmittedThisQuestion || isExpired;

  const timerLabel = useMemo(() => {
    if (isExpired) return 'Time up';
    if (remainingSec === 1) return '1 second left';
    return `${remainingSec} seconds left`;
  }, [isExpired, remainingSec]);

  const showLeaderboard = isExpired || quizLeaderboard.length > 0;

  return (
    <div className="space-y-5">
      <div
        className="rounded-lg border px-4 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {question.questionNumber
                ? `Question ${question.questionNumber}`
                : 'Quiz question'}
            </p>
          </div>

          <div
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              background: isExpired
                ? 'var(--color-error-highlight)'
                : 'var(--color-primary-highlight)',
              color: isExpired ? 'var(--color-error)' : 'var(--color-primary)',
            }}
          >
            {timerLabel}
          </div>
        </div>

        <p
          className="mt-3 text-lg font-semibold leading-snug"
          style={{ color: 'var(--color-text)' }}
        >
          {question.text}
        </p>
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              disabled={isLocked}
              onClick={() =>
                onAnswer({
                  activityId: question.activityId,
                  questionId: question.questionId,
                  optionId: option.id,
                  clientTimeMs: Date.now(),
                })
              }
              className="h-auto w-full justify-start whitespace-normal px-4 py-4 text-left"
              style={{
                borderColor: isSelected
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                background: isSelected
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <span>{option.label}</span>
                {isSelected && (
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Selected
                  </span>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {hasSubmittedThisQuestion && !hasResultForThisQuestion && (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Answer submitted. Waiting for result…
        </div>
      )}

      {answerState?.questionId === question.questionId &&
        answerState?.isCorrect === true && (
          <div
            className="rounded-lg border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: 'var(--color-success)',
              background: 'var(--color-success-highlight)',
              color: 'var(--color-success)',
            }}
          >
            ✓ Correct
            {typeof answerState.awardedPoints === 'number'
              ? ` • +${answerState.awardedPoints} points`
              : ''}
          </div>
        )}

      {answerState?.questionId === question.questionId &&
        answerState?.isCorrect === false && (
          <div
            className="rounded-lg border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: 'var(--color-error)',
              background: 'var(--color-error-highlight)',
              color: 'var(--color-error)',
            }}
          >
            ✕ Incorrect
            {typeof answerState.awardedPoints === 'number'
              ? ` • +${answerState.awardedPoints} points`
              : ''}
          </div>
        )}

      {isExpired && !hasSubmittedThisQuestion && (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Time is up for this question.
        </div>
      )}

      {showLeaderboard && (
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <p
            className="mb-3 text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            Leaderboard
          </p>

          {quizLeaderboard.length > 0 ? (
            <div className="space-y-2">
              {quizLeaderboard.map((entry, index) => (
                <div
                  key={`${entry.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-surface-2)',
                  }}
                >
                  <span style={{ color: 'var(--color-text)' }}>
                    {index + 1}. {entry.name}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {entry.points} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Waiting for leaderboard…
            </div>
          )}
        </div>
      )}
    </div>
  );
}