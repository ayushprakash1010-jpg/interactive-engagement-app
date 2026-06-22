'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePoll } from '@/hooks/use-poll';
import type { Activity } from '@/hooks/use-activities';
import type { FeedbackConfig } from '@/components/poll/feedback-builder';

interface Props {
  activity: Activity;
}

function isFeedbackConfig(config: Activity['config']): config is FeedbackConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'prompt' in config &&
    'fields' in config &&
    Array.isArray((config as FeedbackConfig).fields)
  );
}

export function FeedbackRunPanel({ activity }: Props) {
  const { activeActivity, pollEndsAt } = usePoll(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const feedbackConfig = isFeedbackConfig(activity.config) ? activity.config : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  // Ensure the host panel reflects when the auto-timer closes the poll!
  const isThisActivityClosed =
    activity.status === 'closed' ||
    (activeActivity?._id === activity._id && activeActivity.status === 'closed');

  const fieldCount = feedbackConfig?.fields.length ?? 0;

  // Tick down the host's timer
  useEffect(() => {
    if (!isThisActivityLive || !pollEndsAt) {
      setTimeLeftMs(0);
      return;
    }

    const update = () => {
      const diff = pollEndsAt - Date.now();
      setTimeLeftMs(Math.max(0, diff));
    };

    update();
    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [isThisActivityLive, pollEndsAt]);

  const timeLabel = useMemo(() => {
    if (!pollEndsAt) return null;
    const totalSeconds = Math.ceil(timeLeftMs / 1000);
    const seconds = Math.max(0, totalSeconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeftMs, pollEndsAt]);

  const launch = () => {
    socket.emit(ClientEvents.ACTIVITY_LAUNCH, { activityId: activity._id });
  };

  const close = () => {
    socket.emit(ClientEvents.ACTIVITY_CLOSE, { activityId: activity._id });
  };

  return (
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
              Feedback
            </span>

            {isThisActivityLive && <Badge variant="live" dot>Live</Badge>}

            {isThisActivityLive && timeLabel && (
              <span className="rounded-md border border-brand px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand">
                {timeLabel}
              </span>
            )}

            {isThisActivityClosed && <Badge variant="neutral">Closed</Badge>}
          </div>

          <p className="mt-1 font-semibold text-foreground">{activity.title}</p>

          <p className="mt-1 text-sm text-ink-secondary">
            {feedbackConfig?.prompt ?? 'Feedback prompt unavailable'}
          </p>

          <p className="mt-1 text-sm text-ink-muted">
            {fieldCount} field{fieldCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="shrink-0">
          {isThisActivityLive ? (
            <Button variant="destructive" size="sm" onClick={close}>
              Close feedback
            </Button>
          ) : (
            <Button
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
          )}
        </div>
      </div>

      {feedbackConfig && feedbackConfig.fields.length > 0 && (
        <div className="rounded-md border border-border bg-surface-sunken px-3 py-3">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
            Feedback fields
          </p>

          <div className="mt-2 space-y-2">
            {feedbackConfig.fields.slice(0, 4).map((field, index) => (
              <div key={field.id} className="text-sm">
                <p className="text-foreground">
                  {index + 1}. {field.label || 'Untitled field'}
                </p>
                <p className="text-ink-muted">
                  {field.type === 'rating' ? 'Rating field' : 'Text field'}
                </p>
              </div>
            ))}

            {feedbackConfig.fields.length > 4 && (
              <p className="text-sm text-ink-muted">
                +{feedbackConfig.fields.length - 4} more field
                {feedbackConfig.fields.length - 4 === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}