'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PollResultsChart } from './poll-results-chart';
import type {
  LiveActivity,
  QuizAnswerState,
  QuizLeaderboardEntry,
  QuizQuestionState,
  UsePollReturn,
} from '../../hooks/use-poll';

interface Props {
  activity: LiveActivity;
  tallies: UsePollReturn['tallies'];
  pollEndsAt?: number | null;
  hasSubmitted: boolean;
  onSubmit: UsePollReturn['submitResponse'];
  quizQuestion?: QuizQuestionState | null;
  hasAnsweredQuiz?: boolean;
  quizAnswerState?: QuizAnswerState | null;
  quizLeaderboard?: QuizLeaderboardEntry[];
  onSubmitQuizAnswer?: UsePollReturn['submitQuizAnswer'];
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
  const pollType = config.pollType ?? 'single';
  const options = config.options ?? [];
  const ratingScale = config.ratingScale ?? 5;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [textValue, setTextValue] = useState('');
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedQuizOptionId, setSelectedQuizOptionId] = useState<string>('');
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  
  const [quizTimeLeftMs, setQuizTimeLeftMs] = useState(0);
  const [pollTimeLeftMs, setPollTimeLeftMs] = useState(0);

  useEffect(() => {
    setSelectedIds([]);
    setTextValue('');
    setRatingValue(null);
    setSubmitting(false);
  }, [activity._id]);

  useEffect(() => {
    setSelectedQuizOptionId('');
    setQuizSubmitting(false);
  }, [quizQuestion?.questionId]);

  // Quiz Timer
  useEffect(() => {
    if (activity.type !== 'quiz' || !quizQuestion?.endsAt) {
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
    if (activity.type !== 'poll' || !pollEndsAt) {
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
  const isClosed = activity.status === 'closed' || pollExpired;
  const showResults = hasSubmitted || isClosed;

  const canSubmit = (() => {
    if (submitting || hasSubmitted || isClosed) return false;
    if (pollType === 'single') return selectedIds.length === 1;
    if (pollType === 'multiple') return selectedIds.length > 0;
    if (pollType === 'rating') return ratingValue !== null;
    if (pollType === 'open') return textValue.trim().length > 0;
    return false;
  })();

  const handleSubmit = () => {
    if (submitting || hasSubmitted || isClosed) return;

    setSubmitting(true);

    onSubmit({
      activityId: activity._id,
      selectedOptionIds:
        pollType === 'single' || pollType === 'multiple'
          ? selectedIds
          : undefined,
      textValue: pollType === 'open' ? textValue.trim() : undefined,
      ratingValue: pollType === 'rating' ? (ratingValue ?? undefined) : undefined,
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
    activity.type === 'quiz' &&
    (quizExpired || isClosed || quizLeaderboard.length > 0);

  const canSubmitQuiz =
    activity.type === 'quiz' &&
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [quizTimeLeftMs]);

  const pollTimeLabel = useMemo(() => {
    if (!pollEndsAt) return null;
    const totalSeconds = Math.ceil(pollTimeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (activity.type === 'quiz') {
    const locked = hasAnsweredQuiz || quizExpired || isClosed;
    const questionText = quizQuestion?.text || config.question || 'Waiting for question…';

    return (
      <div className="space-y-5">
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {quizQuestion?.questionNumber
                  ? `Question ${quizQuestion.questionNumber}`
                  : 'Quiz question'}
              </p>
              <p
                className="text-lg font-semibold leading-snug"
                style={{ color: 'var(--color-text)' }}
              >
                {questionText}
              </p>
            </div>

            <div
              className="rounded-md border px-3 py-2 text-sm font-semibold tabular-nums"
              style={{
                borderColor: quizExpired
                  ? 'var(--color-error)'
                  : 'var(--color-border)',
                background: quizExpired
                  ? 'var(--color-error-highlight)'
                  : 'var(--color-surface-2)',
                color: quizExpired
                  ? 'var(--color-error)'
                  : 'var(--color-text)',
              }}
            >
              {quizTimeLabel}
            </div>
          </div>

          {hasAnsweredQuiz && (
            <p
              className="text-sm font-medium"
              style={{
                color:
                  quizAnswerState?.isCorrect === undefined
                    ? 'var(--color-primary)'
                    : quizAnswerState.isCorrect
                      ? 'var(--color-success)'
                      : 'var(--color-error)',
              }}
            >
              {quizAnswerState?.isCorrect === undefined
                ? 'Answer submitted'
                : quizAnswerState.isCorrect
                  ? 'Correct'
                  : 'Incorrect'}
              {typeof quizAnswerState?.awardedPoints === 'number'
                ? ` · +${quizAnswerState.awardedPoints} pts`
                : ''}
            </p>
          )}

          {!hasAnsweredQuiz && quizExpired && (
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-error)' }}
            >
              Time is up.
            </p>
          )}
        </div>

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
                  className="w-full rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-80"
                  style={{
                    borderColor: isSelected
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                    background: isSelected
                      ? 'var(--color-primary-highlight)'
                      : 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                  aria-pressed={isSelected}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p
            className="py-6 text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Waiting for answer options…
          </p>
        )}

        <Button
          type="button"
          onClick={handleQuizSubmit}
          disabled={!canSubmitQuiz}
          className="w-full"
        >
          {quizSubmitting || hasAnsweredQuiz ? 'Answer submitted' : 'Submit answer'}
        </Button>

        {showQuizLeaderboard && (
          <div
            className="rounded-lg border p-4"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <div className="mb-3">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                Leaderboard
              </p>
            </div>

            {quizLeaderboard.length > 0 ? (
              <div className="space-y-2">
                {quizLeaderboard.map((entry, index) => (
                  <div
                    key={`${entry.name}-${index}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
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
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Waiting for leaderboard…
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <p
            className="mb-1 text-sm font-medium"
            style={{ color: pollExpired && !hasSubmitted ? 'var(--color-error)' : 'var(--color-primary)' }}
          >
            {hasSubmitted ? '✓ Response submitted' : pollExpired ? 'Time is up' : 'Poll closed'}
          </p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {config.question}
          </p>
        </div>

        {tallies ? (
          <PollResultsChart tallies={tallies} />
        ) : isClosed ? (
          <p
            className="py-8 text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No responses recorded.
          </p>
        ) : (
          <p
            className="py-8 text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Waiting for results…
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-lg font-semibold leading-snug"
          style={{ color: 'var(--color-text)' }}
        >
          {config.question}
        </p>
        
        {pollEndsAt && (
          <div
            className="shrink-0 rounded-md border px-3 py-2 text-sm font-semibold tabular-nums"
            style={{
              borderColor: pollExpired
                ? 'var(--color-error)'
                : 'var(--color-border)',
              background: pollExpired
                ? 'var(--color-error-highlight)'
                : 'var(--color-surface-2)',
              color: pollExpired
                ? 'var(--color-error)'
                : 'var(--color-text)',
            }}
          >
            {pollTimeLabel}
          </div>
        )}
      </div>

      {pollType === 'single' && (
        <fieldset className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              style={{
                borderColor: selectedIds.includes(opt.id)
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                background: selectedIds.includes(opt.id)
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface)',
              }}
            >
              <input
                type="radio"
                name={`single-choice-${activity._id}`}
                value={opt.id}
                checked={selectedIds.includes(opt.id)}
                onChange={() => setSelectedIds([opt.id])}
                className="accent-[var(--color-primary)]"
              />
              <span style={{ color: 'var(--color-text)' }}>{opt.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      {pollType === 'multiple' && (
        <fieldset className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              style={{
                borderColor: selectedIds.includes(opt.id)
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                background: selectedIds.includes(opt.id)
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface)',
              }}
            >
              <input
                type="checkbox"
                value={opt.id}
                checked={selectedIds.includes(opt.id)}
                onChange={(e) =>
                  setSelectedIds((prev) =>
                    e.target.checked
                      ? [...prev, opt.id]
                      : prev.filter((id) => id !== opt.id),
                  )
                }
                className="accent-[var(--color-primary)]"
              />
              <span style={{ color: 'var(--color-text)' }}>{opt.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      {pollType === 'rating' && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: ratingScale }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRatingValue(n)}
              className="h-11 w-11 rounded-lg border text-sm font-semibold transition-colors"
              style={{
                borderColor:
                  ratingValue === n ? 'var(--color-primary)' : 'var(--color-border)',
                background:
                  ratingValue === n ? 'var(--color-primary)' : 'var(--color-surface)',
                color: ratingValue === n ? '#fff' : 'var(--color-text)',
              }}
              aria-label={`Rate ${n}`}
              aria-pressed={ratingValue === n}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {pollType === 'open' && (
        <Textarea
          placeholder="Type your response…"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          rows={4}
          maxLength={500}
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </Button>
    </div>
  );
}