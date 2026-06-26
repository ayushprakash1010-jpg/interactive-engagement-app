"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Eyebrow, LeaderboardRow } from "@/components/pulse";
import { cn } from "@/lib/utils";
import type {
  QuizLeaderboardEntry,
  QuizQuestionState,
  UsePollReturn,
} from "../../hooks/use-poll";

interface Props {
  question: QuizQuestionState;
  hasAnswered: boolean;
  answerState: UsePollReturn["quizAnswerState"];
  quizLeaderboard: QuizLeaderboardEntry[];
  onAnswer: UsePollReturn["submitQuizAnswer"];
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
    typeof answerState?.isCorrect === "boolean";

  const hasSubmittedThisQuestion =
    hasAnswered && answerState?.questionId === question.questionId;

  const isLocked = hasSubmittedThisQuestion || isExpired;

  const timerLabel = useMemo(() => {
    if (isExpired) return "Time up";
    if (remainingSec === 1) return "1 second left";
    return `${remainingSec} seconds left`;
  }, [isExpired, remainingSec]);

  const showLeaderboard = isExpired || quizLeaderboard.length > 0;

  return (
    <div className="space-y-5">
      <SurfacePanel tone="raised" className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>
            {question.questionNumber
              ? `Question ${question.questionNumber}`
              : "Quiz question"}
          </Eyebrow>

          <div
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
              isExpired
                ? "bg-error-subtle text-destructive"
                : "bg-brand-subtle text-brand-subtle-text",
            )}
          >
            {timerLabel}
          </div>
        </div>

        <p className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
          {question.text}
        </p>
      </SurfacePanel>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={isLocked}
              onClick={() =>
                onAnswer({
                  activityId: question.activityId,
                  questionId: question.questionId,
                  optionId: option.id,
                  clientTimeMs: Date.now(),
                })
              }
              aria-pressed={isSelected}
              className={cn(
                "flex min-h-[3.5rem] w-full items-center justify-between gap-3 rounded-lg border px-4 py-4 text-left text-base font-medium text-foreground shadow-xs transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
                isSelected
                  ? "border-brand bg-brand-subtle ring-1 ring-brand/20"
                  : "border-border bg-surface-raised hover:bg-muted",
              )}
            >
              <span>{option.label}</span>
              {isSelected && (
                <span className="text-sm font-semibold text-brand">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {hasSubmittedThisQuestion && !hasResultForThisQuestion && (
        <EmptyState
          className="py-8"
          title="Answer submitted"
          description="Waiting for the result."
        />
      )}

      {answerState?.questionId === question.questionId &&
        answerState?.isCorrect === true && (
          <div className="rounded-md border border-success bg-success-subtle px-4 py-3 text-sm font-semibold text-success">
            Correct
            {typeof answerState.awardedPoints === "number"
              ? ` +${answerState.awardedPoints} points`
              : ""}
          </div>
        )}

      {answerState?.questionId === question.questionId &&
        answerState?.isCorrect === false && (
          <div className="rounded-md border border-destructive bg-error-subtle px-4 py-3 text-sm font-semibold text-destructive">
            Incorrect
            {typeof answerState.awardedPoints === "number"
              ? ` +${answerState.awardedPoints} points`
              : ""}
          </div>
        )}

      {isExpired && !hasSubmittedThisQuestion && (
        <EmptyState
          className="py-8"
          title="Time is up"
          description="This question is no longer accepting answers."
        />
      )}

      {showLeaderboard && (
        <SurfacePanel tone="raised" className="p-4">
          <div className="mb-3">
            <Eyebrow>Leaderboard</Eyebrow>
          </div>

          {quizLeaderboard.length > 0 ? (
            <div className="space-y-2">
              {quizLeaderboard.map((entry, index) => (
                <LeaderboardRow
                  key={`${entry.name}-${index}`}
                  rank={index + 1}
                  name={entry.name}
                  points={entry.points}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="py-8"
              title="Waiting for leaderboard"
              description="Scores will appear as soon as they are available."
            />
          )}
        </SurfacePanel>
      )}
    </div>
  );
}
