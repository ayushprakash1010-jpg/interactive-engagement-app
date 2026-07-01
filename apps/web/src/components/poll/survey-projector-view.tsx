'use client';

import { useQuery } from '@tanstack/react-query';
import { publicApiFetch } from '@/lib/events-api';
import { SurfacePanel, EmptyState } from '@/components/ui';
import { LiveDot } from '@/components/pulse';
import type { Activity, SurveyConfig } from '@/hooks/use-activities';

interface SurveyProjectorViewProps {
  activity: Pick<Activity, '_id' | 'status' | 'config' | 'title'>;
  eventCode: string;
}

function isSurveyConfig(config: Activity['config']): config is SurveyConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'questions' in config
  );
}

export function SurveyProjectorView({ activity, eventCode }: SurveyProjectorViewProps) {
  const isLive = activity.status === 'live';
  const surveyConfig = isSurveyConfig(activity.config) ? activity.config : null;

  const { data: stats } = useQuery({
    queryKey: ['survey-stats', eventCode, activity._id],
    queryFn: async () => {
      // In the projector, we might not have eventId readily available unless we parse it from somewhere.
      // But we changed the backend to fetch eventId dynamically using activityId. 
      // Thus passing eventCode is perfectly fine for the REST param!
      return publicApiFetch<{ started: number; completed: number }>(`events/${eventCode}/activities/${activity._id}/survey/stats`);
    },
    refetchInterval: isLive ? 3000 : false,
    enabled: isLive || activity.status === 'closed',
  });

  const completionPercentage = stats && stats.started > 0 
    ? Math.round((stats.completed / stats.started) * 100) 
    : 0;

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 text-left">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-1.5">
          {isLive && <LiveDot />}
          <span className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            {isLive ? 'Live survey' : 'Survey closed'}
          </span>
        </div>
        <h1 className="mx-auto max-w-5xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          {activity.title}
        </h1>
        {surveyConfig && (
          <p className="text-xl text-ink-muted">
            {surveyConfig.questions.length} question{surveyConfig.questions.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <SurfacePanel className="rounded-lg border-border bg-surface-card/85 p-8 shadow-xs backdrop-blur lg:p-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-border/50 bg-background/50 p-6 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Completion Rate
            </span>
            <span className="text-6xl font-bold tabular-nums text-foreground">
              {completionPercentage}%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-border/50 bg-background/50 p-6 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Started
            </span>
            <span className="text-6xl font-bold tabular-nums text-foreground">
              {stats?.started ?? 0}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-border/50 bg-background/50 p-6 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">
              Completed
            </span>
            <span className="text-6xl font-bold tabular-nums text-brand">
              {stats?.completed ?? 0}
            </span>
          </div>
        </div>

        {isLive && (
          <div className="mt-8 text-center">
            <p className="text-lg text-ink-secondary">
              Join at <span className="font-semibold text-foreground">pulse.app</span> and enter code{' '}
              <span className="font-mono font-bold text-foreground">{eventCode}</span>
            </p>
          </div>
        )}
      </SurfacePanel>
    </section>
  );
}
