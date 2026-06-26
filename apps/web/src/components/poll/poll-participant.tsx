"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Eyebrow, LeaderboardRow } from "@/components/pulse";
import { cn } from "@/lib/utils";
import { PollResultsChart } from "./poll-results-chart";
import type {
  LiveActivity,
  QuizAnswerState,
  QuizLeaderboardEntry,
  QuizQuestionState,
  UsePollReturn,
} from "../../hooks/use-poll";

interface Props {
  activity: LiveActivity;
  tallies: UsePollReturn["tallies"];
  pollEndsAt?: number | null;
  hasSubmitted: boolean;
  onSubmit: UsePollReturn["submitResponse"];
  quizQuestion?: QuizQuestionState | null;
  hasAnsweredQuiz?: boolean;
  quizAnswerState?: QuizAnswerState | null;
  quizLeaderboard?: QuizLeaderboardEntry[];
  onSubmitQuizAnswer?: UsePollReturn["submitQuizAnswer"];
}

function TimerPill({ label, expired }: { label: string; expired: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-sm px-3 py-1.5 text-sm font-semibold tabular-nums",
        expired
          ? "bg-error-subtle text-destructive"
          : "bg-brand-subtle text-brand-subtle-text",
      )}
    >
      {label}
    </div>
  );
}

export function PollParticipant({
  activity,
  tallies,
  pollEndsAt = null,
  hasSubmitted,
  onSubmit,
  quizQuestion = null,
  hasAnsweredQuiz = false,
  quizAnswerState = null,
  quizLeaderboard = [],
  onSubmitQuizAnswer,
}: Props) {
  const config = activity.config;
  const pollType = config.pollType ?? "single";
  const options = config.options ?? [];
  const ratingScale = config.ratingScale ?? 5;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedQuizOptionId, setSelectedQuizOptionId] = useState<string>("");
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const [quizTimeLeftMs, setQuizTimeLeftMs] = useState(0);
  const [pollTimeLeftMs, setPollTimeLeftMs] = useState(0);

  useEffect(() => {
    setSelectedIds([]);
    setTextValue("");
    setRatingValue(null);
    setSubmitting(false);
  }, [activity._id]);

  useEffect(() => {
    setSelectedQuizOptionId("");
    setQuizSubmitting(false);
  }, [quizQuestion?.questionId]);

  // Quiz Timer
  useEffect(() => {
    if (activity.type !== "quiz" || !quizQuestion?.endsAt) {
      setQuizTimeLeftMs(0);
      return;
    }

    const update = () => {
      const diff = new Date(quizQuestion.endsAt).getTime() - Date.now();
      setQuizTimeLeftMs(Math.max(0, diff));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [activity.type, quizQuestion?.endsAt, quizQuestion?.questionId]);

  // Poll Timer
  useEffect(() => {
    if (activity.type !== "poll" || !pollEndsAt) {
      setPollTimeLeftMs(0);
      return;
    }

    const update = () => {
      const diff = pollEndsAt - Date.now();
      setPollTimeLeftMs(Math.max(0, diff));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [activity.type, pollEndsAt]);

  const pollExpired = !!pollEndsAt && pollTimeLeftMs <= 0;
  const isClosed = activity.status === "closed" || pollExpired;
  const showResults = hasSubmitted || isClosed;

  const canSubmit = (() => {
    if (submitting || hasSubmitted || isClosed) return false;
    if (pollType === "single") return selectedIds.length === 1;
    if (pollType === "multiple") return selectedIds.length > 0;
    if (pollType === "rating") return ratingValue !== null;
    if (pollType === "open") return textValue.trim().length > 0;
    return false;
  })();

  const handleSubmit = () => {
    if (submitting || hasSubmitted || isClosed) return;

    setSubmitting(true);

    onSubmit({
      activityId: activity._id,
      selectedOptionIds:
        pollType === "single" || pollType === "multiple"
          ? selectedIds
          : undefined,
      textValue: pollType === "open" ? textValue.trim() : undefined,
      ratingValue:
        pollType === "rating" ? (ratingValue ?? undefined) : undefined,
    });
  };

  // THE FIX: Auto-submit their answer 1.5 seconds before the timer runs out!
  useEffect(() => {
    if (
      pollTimeLeftMs > 0 &&
      pollTimeLeftMs <= 1500 &&
      !hasSubmitted &&
      !submitting &&
      canSubmit
    ) {
      handleSubmit();
    }
  }, [pollTimeLeftMs, hasSubmitted, submitting, canSubmit]);

  const quizExpired = quizTimeLeftMs <= 0;
  const showQuizLeaderboard =
    activity.type === "quiz" &&
    (quizExpired || isClosed || quizLeaderboard.length > 0);

  const canSubmitQuiz =
    activity.type === "quiz" &&
    !!quizQuestion &&
    !!selectedQuizOptionId &&
    !quizExpired &&
    !isClosed &&
    !hasAnsweredQuiz &&
    !quizSubmitting &&
    !!onSubmitQuizAnswer;

  const quizTimeLabel = useMemo(() => {
    const totalSeconds = Math.ceil(quizTimeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [quizTimeLeftMs]);

  const pollTimeLabel = useMemo(() => {
    if (!pollEndsAt) return null;
    const totalSeconds = Math.ceil(pollTimeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [pollTimeLeftMs, pollEndsAt]);

  const handleQuizSubmit = () => {
    if (
      !quizQuestion ||
      !selectedQuizOptionId ||
      !onSubmitQuizAnswer ||
      hasAnsweredQuiz ||
      quizExpired ||
      quizSubmitting
    ) {
      return;
    }

    setQuizSubmitting(true);

    onSubmitQuizAnswer({
      activityId: quizQuestion.activityId,
      questionId: quizQuestion.questionId,
      optionId: selectedQuizOptionId,
      clientTimeMs: Date.now(),
    });
  };

  if (activity.type === "quiz") {
    const locked = hasAnsweredQuiz || quizExpired || isClosed;
    const questionText =
      quizQuestion?.text || config.question || "Waiting for question…";

    return (
      <div className="space-y-5">
        <SurfacePanel tone="raised" className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Eyebrow>
                {quizQuestion?.questionNumber
                  ? `Question ${quizQuestion.questionNumber}`
                  : "Quiz question"}
              </Eyebrow>
              <p className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
                {questionText}
              </p>
            </div>

            <TimerPill label={quizTimeLabel} expired={quizExpired} />
          </div>

          {hasAnsweredQuiz && (
            <p className="text-sm font-medium">
              {quizAnswerState?.isCorrect === undefined ? (
                <span className="text-brand">Answer submitted</span>
              ) : quizAnswerState.isCorrect ? (
                <span className="text-success">Correct</span>
              ) : (
                <span className="text-destructive">Incorrect</span>
              )}
              {typeof quizAnswerState?.awardedPoints === "number"
                ? ` +${quizAnswerState.awardedPoints} pts`
                : ""}
            </p>
          )}

          {!hasAnsweredQuiz && quizExpired && (
            <p className="text-sm font-medium text-destructive">Time is up.</p>
          )}
        </SurfacePanel>

        {quizQuestion?.options?.length ? (
          <div className="space-y-2">
            {quizQuestion.options.map((opt) => {
              const isSelected =
                selectedQuizOptionId === opt.id ||
                quizAnswerState?.selectedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (locked) return;
                    setSelectedQuizOptionId(opt.id);
                  }}
                  disabled={locked}
                  className={cn(
                    "min-h-[3.5rem] w-full rounded-lg border px-4 py-3 text-left text-base font-medium text-foreground shadow-xs transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80",
                    isSelected
                      ? "border-brand bg-brand-subtle ring-1 ring-brand/20"
                      : "border-border bg-surface-raised hover:bg-muted",
                  )}
                  aria-pressed={isSelected}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Waiting for options"
            description="Answer choices will appear when the host sends them."
          />
        )}

        <Button
          type="button"
          onClick={handleQuizSubmit}
          disabled={!canSubmitQuiz}
          size="lg"
          className="w-full"
        >
          {quizSubmitting || hasAnsweredQuiz
            ? "Answer submitted"
            : "Submit answer"}
        </Button>

        {showQuizLeaderboard && (
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

  if (showResults) {
    return (
      <div className="space-y-4">
        <SurfacePanel tone="raised" className="p-4">
          {hasSubmitted ? (
            <Badge variant="success" className="mb-2">
              Vote submitted
            </Badge>
          ) : pollExpired ? (
            <Badge variant="destructive" className="mb-2">
              Time is up
            </Badge>
          ) : (
            <Badge variant="neutral" className="mb-2">
              Poll closed
            </Badge>
          )}
          <p className="font-display font-semibold tracking-tight text-foreground">
            {config.question}
          </p>
        </SurfacePanel>

        {tallies ? (
          <PollResultsChart tallies={tallies} />
        ) : isClosed ? (
          <EmptyState
            title="No responses recorded"
            description="There were no poll submissions for this activity."
          />
        ) : (
          <EmptyState
            title="Waiting for results"
            description="Responses will appear here once the host shares them."
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
          {config.question}
        </p>

        {pollEndsAt && pollTimeLabel && (
          <TimerPill label={pollTimeLabel} expired={pollExpired} />
        )}
      </div>

      {pollType === "single" && (
        <fieldset className="space-y-2">
          {options.map((opt) => {
            const checked = selectedIds.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex min-h-[3.5rem] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 shadow-xs transition-colors duration-fast focus-within:ring-2 focus-within:ring-ring",
                  checked
                    ? "border-brand bg-brand-subtle ring-1 ring-brand/20"
                    : "border-border bg-surface-raised hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name={`single-choice-${activity._id}`}
                  value={opt.id}
                  checked={checked}
                  onChange={() => setSelectedIds([opt.id])}
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-base text-foreground">{opt.label}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {pollType === "multiple" && (
        <fieldset className="space-y-2">
          {options.map((opt) => {
            const checked = selectedIds.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex min-h-[3.5rem] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 shadow-xs transition-colors duration-fast focus-within:ring-2 focus-within:ring-ring",
                  checked
                    ? "border-brand bg-brand-subtle ring-1 ring-brand/20"
                    : "border-border bg-surface-raised hover:bg-muted",
                )}
              >
                <input
                  type="checkbox"
                  value={opt.id}
                  checked={checked}
                  onChange={(e) =>
                    setSelectedIds((prev) =>
                      e.target.checked
                        ? [...prev, opt.id]
                        : prev.filter((id) => id !== opt.id),
                    )
                  }
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-base text-foreground">{opt.label}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {pollType === "rating" && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: ratingScale }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRatingValue(n)}
              className={cn(
                "h-12 w-12 rounded-lg border text-base font-semibold tabular-nums shadow-xs transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                ratingValue === n
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-surface-raised text-foreground hover:bg-muted",
              )}
              aria-label={`Rate ${n}`}
              aria-pressed={ratingValue === n}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {pollType === "open" && (
        <Textarea
          placeholder="Type your response..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          rows={4}
          maxLength={500}
        />
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        size="lg"
        className="w-full"
      >
        {submitting ? "Submitting…" : "Submit your vote"}
      </Button>
    </div>
  );
}
