'use client';

import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { usePoll } from '@/hooks/use-poll';
import type { Activity, QuizConfig } from '@/hooks/use-activities';

interface Props {
  activity: Activity;
}

function isQuizConfig(config: Activity['config']): config is QuizConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'questions' in config &&
    Array.isArray((config as QuizConfig).questions)
  );
}

export function QuizRunPanel({ activity }: Props) {
  const { activeActivity } = usePoll(null);

  const quizConfig = isQuizConfig(activity.config) ? activity.config : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  const isThisActivityClosed = activity.status === 'closed';

  const questionCount = quizConfig?.questions.length ?? 0;
  const firstQuestion = quizConfig?.questions[0];

  const launch = () => {
    socket.emit(ClientEvents.ACTIVITY_LAUNCH, { activityId: activity._id });
  };

  const close = () => {
    socket.emit(ClientEvents.ACTIVITY_CLOSE, { activityId: activity._id });
  };

  const nextQuestion = () => {
    socket.emit(ClientEvents.QUIZ_NEXT_QUESTION, { activityId: activity._id });
  };

  return (
    <div
      className="space-y-4 rounded-xl border p-5"
      style={{
        borderColor: isThisActivityLive
          ? 'var(--color-primary)'
          : 'var(--color-border)',
        background: isThisActivityLive
          ? 'var(--color-primary-highlight)'
          : 'var(--color-surface)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Quiz
            </span>

            {isThisActivityLive && <LiveBadge />}

            {isThisActivityClosed && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  background: 'var(--color-surface-offset)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Closed
              </span>
            )}
          </div>

          <p
            className="mt-0.5 font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            {activity.title}
          </p>

          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {questionCount} question{questionCount === 1 ? '' : 's'}
            {firstQuestion ? ` • Starts with: ${firstQuestion.text}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isThisActivityLive ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={nextQuestion}
              >
                Next question
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={close}
                style={{
                  borderColor: 'var(--color-error)',
                  color: 'var(--color-error)',
                }}
              >
                Close quiz
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={launch}
              disabled={isAnotherActivityLive}
              title={
                isAnotherActivityLive
                  ? 'Another activity is live — close it first'
                  : undefined
              }
              style={{
                background: '#0f172a',
                color: '#ffffff',
                opacity: isAnotherActivityLive ? 0.5 : 1,
              }}
            >
              {isThisActivityClosed ? 'Relaunch' : 'Launch'}
            </Button>
          )}
        </div>
      </div>

      {quizConfig && quizConfig.questions.length > 0 && (
        <div
          className="rounded-lg border px-3 py-3"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface-2)',
          }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Quiz details
          </p>

          <div className="mt-2 space-y-2">
            {quizConfig.questions.slice(0, 3).map((question, index) => (
              <div key={question.id} className="text-sm">
                <p style={{ color: 'var(--color-text)' }}>
                  {index + 1}. {question.text || 'Untitled question'}
                </p>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {question.options.length} options • {question.points} points •{' '}
                  {question.timeLimitSec}s timer
                </p>
              </div>
            ))}

            {quizConfig.questions.length > 3 && (
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                +{quizConfig.questions.length - 3} more question
                {quizConfig.questions.length - 3 === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        background: 'var(--color-primary)',
        color: '#fff',
      }}
    >
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
        aria-hidden="true"
      />
      LIVE
    </span>
  );
}