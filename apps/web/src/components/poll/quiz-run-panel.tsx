'use client';

import * as React from 'react';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notification-store';
import { Badge } from '@/components/ui/badge';
import { usePoll } from '@/hooks/use-poll';
import type { Activity, QuizConfig } from '@/hooks/use-activities';
import { QuizScorecardModal } from '@/components/poll/quiz-scorecard-modal';

interface Props {
  activity: Activity;
  /** Event ID — required to load scorecard analytics */
  eventId?: string;
}

function isQuizConfig(config: Activity['config']): config is QuizConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'questions' in config &&
    Array.isArray((config as QuizConfig).questions)
  );
}

export function QuizRunPanel({ activity, eventId }: Props) {
  const { activeActivity } = usePoll(null);
  const [scorecardOpen, setScorecardOpen] = React.useState(false);

  const quizConfig = isQuizConfig(activity.config) ? activity.config : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  const isThisActivityClosed = activity.status === 'closed';

  // Show Results button only when the quiz has been run at least once (closed)
  // and we have an eventId to fetch analytics from.
  const showResultsButton = isThisActivityClosed && Boolean(eventId);

  const questionCount = quizConfig?.questions.length ?? 0;
  const firstQuestion = quizConfig?.questions[0];

  const launch = () => {
    socket.emit(ClientEvents.ACTIVITY_LAUNCH, { activityId: activity._id });
    notify({
      type: 'quiz-launched',
      description: `${activity.title} is now live.`,
      href: `/dashboard/events/${activity.eventId}`,
    });
  };

  const close = () => {
    socket.emit(ClientEvents.ACTIVITY_CLOSE, { activityId: activity._id });
    notify({
      type: 'quiz-finished',
      description: `${activity.title} was closed.`,
      href: `/dashboard/events/${activity.eventId}`,
    });
  };

  const nextQuestion = () => {
    socket.emit(ClientEvents.QUIZ_NEXT_QUESTION, { activityId: activity._id });
  };

  return (
    <>
      <div
        className={cn(
          'space-y-4 rounded-lg border p-5 transition-colors duration-base ease-standard',
          isThisActivityLive
            ? 'border-brand bg-brand-subtle/40 shadow-sm'
            : 'border-border bg-surface-card',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Quiz
              </span>

              {isThisActivityLive && <Badge variant="live" dot>Live</Badge>}

              {isThisActivityClosed && <Badge variant="neutral">Closed</Badge>}
            </div>

            <p className="mt-1 font-semibold text-foreground">{activity.title}</p>

            <p className="mt-1 text-sm text-ink-secondary">
              {questionCount} question{questionCount === 1 ? '' : 's'}
              {firstQuestion ? ` · Starts with: ${firstQuestion.text}` : ''}
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
                  variant="destructive"
                  size="sm"
                  onClick={close}
                >
                  Close quiz
                </Button>
              </>
            ) : (
              <>
                {showResultsButton && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScorecardOpen(true)}
                  >
                    Results
                  </Button>
                )}

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
                >
                  {isThisActivityClosed ? 'Relaunch' : 'Launch'}
                </Button>
              </>
            )}
          </div>
        </div>

        {quizConfig && quizConfig.questions.length > 0 && (
          <div className="rounded-md border border-border bg-surface-sunken px-3 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
              Quiz details
            </p>

            <div className="mt-2 space-y-2">
              {quizConfig.questions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="text-sm">
                  <p className="text-foreground">
                    {index + 1}. {question.text || 'Untitled question'}
                  </p>
                  <p className="text-ink-muted">
                    {question.options.length} options · {question.points} points ·{' '}
                    {question.timeLimitSec}s timer
                  </p>
                </div>
              ))}

              {quizConfig.questions.length > 3 && (
                <p className="text-sm text-ink-muted">
                  +{quizConfig.questions.length - 3} more question
                  {quizConfig.questions.length - 3 === 1 ? '' : 's'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scorecard modal — only mounted when eventId is available */}
      {eventId && (
        <QuizScorecardModal
          open={scorecardOpen}
          onOpenChange={setScorecardOpen}
          eventId={eventId}
          activityId={activity._id}
          quizTitle={activity.title}
        />
      )}
    </>
  );
}
