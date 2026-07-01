'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClientEvents } from '@iep/types';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notification-store';
import { Badge } from '@/components/ui/badge';
import { usePoll } from '@/hooks/use-poll';
import { apiFetch } from '@/lib/events-api';
import type { Activity, SurveyConfig } from '@/hooks/use-activities';

interface Props {
  activity: Activity;
  eventId: string;
}

function isSurveyConfig(config: Activity['config']): config is SurveyConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'questions' in config
  );
}

export function SurveyRunPanel({ activity, eventId }: Props) {
  const { activeActivity, pollEndsAt } = usePoll(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const surveyConfig = isSurveyConfig(activity.config) ? activity.config : null;

  const isThisActivityLive =
    activeActivity?._id === activity._id && activeActivity.status === 'live';

  const isAnotherActivityLive =
    activeActivity !== null &&
    activeActivity._id !== activity._id &&
    activeActivity.status === 'live';

  const isThisActivityClosed =
    activity.status === 'closed' ||
    (activeActivity?._id === activity._id && activeActivity.status === 'closed');

  const { data: stats } = useQuery({
    queryKey: ['survey-stats', eventId, activity._id],
    queryFn: async () => {
      return apiFetch<{ started: number; completed: number }>(`events/${eventId}/activities/${activity._id}/survey/stats`);
    },
    refetchInterval: isThisActivityLive ? 3000 : false,
    enabled: isThisActivityLive || isThisActivityClosed,
  });

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
      type: 'poll-launched',
      description: `${activity.title} is now live.`,
      href: `/dashboard/events/${eventId}`,
    });
  };

  const close = () => {
    socket.emit(ClientEvents.ACTIVITY_CLOSE, { activityId: activity._id });
    notify({
      type: 'poll-closed',
      description: `${activity.title} was closed.`,
      href: `/dashboard/events/${eventId}`,
    });
  };

  const completionPercentage = useMemo(() => {
    if (!stats || stats.started === 0) return 0;
    return Math.round((stats.completed / stats.started) * 100);
  }, [stats]);

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
              Survey
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
            {activity.title}
          </p>
          {surveyConfig && (
            <p className="text-sm text-ink-secondary">
              {surveyConfig.questions.length} question{surveyConfig.questions.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {isThisActivityLive ? (
            <Button variant="destructive" size="sm" onClick={close}>
              Close survey
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

      {(isThisActivityLive || isThisActivityClosed) && (
        <div className="pt-4 border-t border-border/50">
          {stats ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Progress</p>
                <p className="text-2xl font-semibold mt-1">{completionPercentage}%</p>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-xs text-ink-secondary uppercase tracking-wider font-semibold">Started</p>
                  <p className="text-lg font-medium">{stats.started}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-secondary uppercase tracking-wider font-semibold">Completed</p>
                  <p className="text-lg font-medium text-brand">{stats.completed}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-2 text-sm text-ink-muted">
              Loading stats...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
