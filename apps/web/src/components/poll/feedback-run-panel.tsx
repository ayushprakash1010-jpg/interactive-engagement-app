'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
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
              Feedback
            </span>

            {isThisActivityLive && <LiveBadge />}

            {isThisActivityLive && timeLabel && (
              <span 
                className="rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums" 
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                {timeLabel}
              </span>
            )}

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
            {feedbackConfig?.prompt ?? 'Feedback prompt unavailable'}
          </p>

          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {fieldCount} field{fieldCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="shrink-0">
          {isThisActivityLive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={close}
              style={{
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)',
              }}
            >
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
              style={{
                background: '#0f172a',
                color: '#fff',
                opacity: isAnotherActivityLive ? 0.5 : 1,
              }}
            >
              {isThisActivityClosed ? 'Relaunch' : 'Launch'}
            </Button>
          )}
        </div>
      </div>

      {feedbackConfig && feedbackConfig.fields.length > 0 && (
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
            Feedback fields
          </p>

          <div className="mt-2 space-y-2">
            {feedbackConfig.fields.slice(0, 4).map((field, index) => (
              <div key={field.id} className="text-sm">
                <p style={{ color: 'var(--color-text)' }}>
                  {index + 1}. {field.label || 'Untitled field'}
                </p>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {field.type === 'rating' ? 'Rating field' : 'Text field'}
                </p>
              </div>
            ))}

            {feedbackConfig.fields.length > 4 && (
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
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