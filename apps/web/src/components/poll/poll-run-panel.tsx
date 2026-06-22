'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
      className={cn(
        'space-y-4 rounded-lg border p-5 transition-colors duration-base ease-standard',
        isThisActivityLive
          ? 'border-brand bg-brand-subtle/40 shadow-sm'
          : 'border-border bg-surface-card',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {POLL_TYPE_LABELS[pollConfig?.pollType ?? 'single']}
            </span>

            {isThisActivityLive && <Badge variant="live" dot>Live</Badge>}

            {isThisActivityLive && timeLabel && (
              <span className="rounded-md border border-brand px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand">
                {timeLabel}
              </span>
            )}

            {isThisActivityClosed && <Badge variant="neutral">Closed</Badge>}
          </div>

          <p className="mt-1 font-semibold text-foreground">
            {pollConfig?.question ?? activity.title}
          </p>
        </div>

        <div className="shrink-0">
          {isThisActivityLive ? (
            <Button variant="destructive" size="sm" onClick={close}>
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
            <p className="py-6 text-center text-sm text-ink-muted">
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

const POLL_TYPE_LABELS: Record<string, string> = {
  single: 'Single Choice',
  multiple: 'Multiple Choice',
  rating: 'Rating Scale',
  open: 'Open Text',
};