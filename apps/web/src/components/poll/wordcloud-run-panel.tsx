'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notification-store';
import { Badge } from '@/components/ui/badge';
import { usePoll } from '@/hooks/use-poll';
import type { Activity, WordCloudConfig } from '@/hooks/use-activities';

interface Props {
  activity: Activity;
}

function isWordCloudConfig(
  config: Activity['config'],
): config is WordCloudConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'prompt' in config &&
    !('fields' in config) &&
    !('questions' in config) &&
    !('pollType' in config)
  );
}

export function WordCloudRunPanel({ activity }: Props) {
  const { activeActivity, pollEndsAt } = usePoll(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const wordCloudConfig = isWordCloudConfig(activity.config)
    ? activity.config
    : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  // Include server auto-close logic
  const isThisActivityClosed = 
    activity.status === 'closed' ||
    (activeActivity?._id === activity._id && activeActivity.status === 'closed');
    
  const maxWords = wordCloudConfig?.maxWordsPerParticipant ?? 3;

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
    notify({
      type: 'wordcloud-launched',
      description: `${activity.title} is now live.`,
      href: `/dashboard/events/${activity.eventId}`,
    });
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
              Word cloud
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
            {wordCloudConfig?.prompt ?? 'Word cloud prompt unavailable'}
          </p>

          <p className="mt-1 text-sm text-ink-muted">
            Up to {maxWords} word{maxWords === 1 ? '' : 's'} per participant
          </p>
        </div>

        <div className="shrink-0">
          {isThisActivityLive ? (
            <Button variant="destructive" size="sm" onClick={close}>
              Close word cloud
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
    </div>
  );
}
