'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { usePoll } from '@/hooks/use-poll';
import type { Activity, PollConfig } from '@/hooks/use-activities';
import { PollResultsChart } from './poll-results-chart';

interface Props {
  activity: Activity;
}

function isPollConfig(config: Activity['config']): config is PollConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'pollType' in config &&
    'question' in config
  );
}

export function PollRunPanel({ activity }: Props) {
  const { activeActivity, tallies, pollEndsAt } = usePoll(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const pollConfig = isPollConfig(activity.config) ? activity.config : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  // THE FIX: Ensure the host panel reflects when the auto-timer closes the poll!
  const isThisActivityClosed =
    activity.status === 'closed' ||
    (activeActivity?._id === activity._id && activeActivity.status === 'closed');

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {POLL_TYPE_LABELS[pollConfig?.pollType ?? 'single']}
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
            {pollConfig?.question ?? activity.title}
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
              Close poll
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

      {isThisActivityLive && (
        <div className="pt-2">
          {tallies ? (
            <PollResultsChart tallies={tallies} />
          ) : (
            <p
              className="py-6 text-center text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Waiting for first response…
            </p>
          )}
        </div>
      )}

      {isThisActivityClosed && tallies && (
        <div className="pt-2 opacity-75">
          <PollResultsChart tallies={tallies} />
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

const POLL_TYPE_LABELS: Record<string, string> = {
  single: 'Single Choice',
  multiple: 'Multiple Choice',
  rating: 'Rating Scale',
  open: 'Open Text',
};