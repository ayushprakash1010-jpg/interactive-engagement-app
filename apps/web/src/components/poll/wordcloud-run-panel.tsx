'use client';

import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
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
  const { activeActivity } = usePoll(null);

  const wordCloudConfig = isWordCloudConfig(activity.config)
    ? activity.config
    : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  const isThisActivityClosed = activity.status === 'closed';
  const maxWords = wordCloudConfig?.maxWordsPerParticipant ?? 3;

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
              Word cloud
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
            {wordCloudConfig?.prompt ?? 'Word cloud prompt unavailable'}
          </p>

          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Up to {maxWords} word{maxWords === 1 ? '' : 's'} per participant
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
