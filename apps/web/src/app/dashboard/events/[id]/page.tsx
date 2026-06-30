'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  Pencil,
  Trash2,
  Plus,
  Square,
  BarChart3,
  BarChart2,
  ListChecks,
  Star,
  Cloud,
} from 'lucide-react';
import { JoinCode, LiveDot, ActivityTile } from '@/components/pulse';
import { cn } from '@/lib/utils';
import { QuizRunPanel } from '@/components/poll/quiz-run-panel';
import { FeedbackRunPanel } from '@/components/poll/feedback-run-panel';
import { WordCloudRunPanel } from '@/components/poll/wordcloud-run-panel';
import {
  ActionGroup,
  BackLink,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  LoadingSkeleton,
  MetricCard,
  PageHeader,
  SectionHeader,
  StatusBadge,
  SurfacePanel,
} from '@/components/ui';
import { EventForm } from '@/components/event-form';
import { ConnectionStatus } from '@/components/connection-status';
import { useToast } from '@/components/ui/use-toast';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { QuestionModerationPanel } from '@/components/questions/question-moderation-panel';
import { useEvent, useEventQr, useUpdateEvent, useDeleteEvent } from '@/lib/use-events';
import { ApiError } from '@/lib/events-api';
import { notify } from '@/lib/notification-store';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  type Activity,
  type CreateActivityPayload,
  type PollConfig,
  type QuizConfig,
  type WordCloudConfig,
} from '@/hooks/use-activities';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/lib/socket';
import { ServerEvents } from '@iep/types';
import { PollBuilder } from '@/components/poll/poll-builder';
import { QuizBuilder } from '@/components/poll/quiz-builder';
import { PollRunPanel } from '@/components/poll/poll-run-panel';
import { WordCloudBuilder } from '@/components/poll/wordcloud-builder';
import { FeedbackBuilder, type FeedbackConfig } from '@/components/poll/feedback-builder';

type Tab = 'overview' | 'polls' | 'qa';
type BuilderType = 'poll' | 'quiz' | 'feedback' | 'wordcloud';

function isPollConfig(config: Activity['config']): config is PollConfig {
  return (
    typeof config === 'object' && config !== null && 'pollType' in config && 'question' in config
  );
}

function isQuizConfig(config: Activity['config']): config is QuizConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'questions' in config &&
    Array.isArray((config as QuizConfig).questions)
  );
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

function isWordCloudConfig(config: Activity['config']): config is WordCloudConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'prompt' in config &&
    !('fields' in config) &&
    !('questions' in config) &&
    !('pollType' in config)
  );
}

const defaultFeedbackConfig: FeedbackConfig = {
  prompt: '',
  fields: [],
};

const ACTIVITY_TYPE_META = {
  poll: {
    label: 'Poll',
    icon: BarChart3,
    description: 'Live audience question with instant results.',
  },
  quiz: {
    label: 'Quiz',
    icon: ListChecks,
    description: 'Timed scored questions with results.',
  },
  feedback: {
    label: 'Feedback',
    icon: Star,
    description: 'Ratings and written comments from participants.',
  },
  wordcloud: {
    label: 'Word cloud',
    icon: Cloud,
    description: 'Short responses visualized by popularity.',
  },
} satisfies Record<
  BuilderType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
>;

import { useScheduledEventStatus } from '@/lib/use-event-status';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const { data: event, isLoading, isError, error } = useEvent(id);
  const { data: qr } = useEventQr(id);

  const {
    count: liveCount,
    allQuestions,
    moderateQuestion,
    endSession,
    isEndingSession,
    sessionEnded,
    sessionEndError,
    resetSessionEndState,
    replyQuestion,
  } = useEventRealtime(event?.eventCode, 'observe', { eventId: id });

  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();

  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(id);
  const createActivity = useCreateActivity(id);
  const updateActivity = useUpdateActivity(id);
  const deleteActivity = useDeleteActivity(id);
  const queryClient = useQueryClient();

  const scheduledStatus = useScheduledEventStatus(event);

  React.useEffect(() => {
    const invalidateActivities = () => {
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', id] });
    };

    socket.on(ServerEvents.ACTIVITY_LAUNCHED, invalidateActivities);
    socket.on(ServerEvents.ACTIVITY_CLOSED, invalidateActivities);

    return () => {
      socket.off(ServerEvents.ACTIVITY_LAUNCHED, invalidateActivities);
      socket.off(ServerEvents.ACTIVITY_CLOSED, invalidateActivities);
    };
  }, [id, queryClient]);

  const activities: Activity[] = React.useMemo(() => {
    return Array.isArray(activitiesData) ? activitiesData : [];
  }, [activitiesData]);

  const [activeTab, setActiveTab] = React.useState<Tab>('overview');
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<Activity | null>(null);
  const [builderType, setBuilderType] = React.useState<BuilderType>('poll');
  const [copied, setCopied] = React.useState(false);
  const [isModerating, setIsModerating] = React.useState(false);
  const [feedbackDraft, setFeedbackDraft] = React.useState<FeedbackConfig>(defaultFeedbackConfig);

  const pollActivities = activities.filter((activity) => activity.type === 'poll');
  const quizActivities = activities.filter((activity) => activity.type === 'quiz');
  const feedbackActivities = activities.filter((activity) => activity.type === 'feedback');
  const wordcloudActivities = activities.filter((activity) => activity.type === 'wordcloud');

  const pendingQuestions = React.useMemo(
    () =>
      [...allQuestions]
        .filter((question) => question.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allQuestions],
  );

  const approvedQuestions = React.useMemo(
    () =>
      [...allQuestions]
        .filter((question) => question.status === 'approved')
        .sort((a, b) => {
          if (b.voteCount !== a.voteCount) {
            return b.voteCount - a.voteCount;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
    [allQuestions],
  );

  const answeredQuestions = React.useMemo(
    () =>
      [...allQuestions]
        .filter((question) => question.status === 'answered')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allQuestions],
  );

  React.useEffect(() => {
    if (!sessionEnded) return;

    toast({ title: 'Session ended' });
    resetSessionEndState();
    router.push(`/dashboard/events/${id}/analytics`);
  }, [sessionEnded, id, resetSessionEndState, router, toast]);

  React.useEffect(() => {
    if (!sessionEndError) return;

    toast({
      variant: 'destructive',
      title: 'Could not end session',
      description: sessionEndError,
    });
  }, [sessionEndError, toast]);

  const handleEndSession = () => {
    if (!event || event.status === 'ended') return;
    endSession({ eventId: id });
  };

  const handleCopy = async () => {
    if (!qr?.joinUrl) return;
    await navigator.clipboard.writeText(qr.joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetBuilderState = () => {
    setBuilderOpen(false);
    setEditingActivity(null);
    setBuilderType('poll');
    setFeedbackDraft(defaultFeedbackConfig);
  };

  const handleSaveActivity = async (payload: CreateActivityPayload) => {
    const activityLabel =
      payload.type === 'quiz'
        ? 'quiz'
        : payload.type === 'feedback'
          ? 'feedback'
          : payload.type === 'wordcloud'
            ? 'word cloud'
            : 'poll';

    const titleCaseLabel =
      activityLabel === 'quiz'
        ? 'Quiz'
        : activityLabel === 'feedback'
          ? 'Feedback'
          : activityLabel === 'word cloud'
            ? 'Word cloud'
            : 'Poll';

    try {
      if (editingActivity) {
        await updateActivity.mutateAsync({
          activityId: editingActivity._id,
          payload: {
            title: payload.title,
            config: payload.config,
          },
        });

        toast({ title: `${titleCaseLabel} updated` });
      } else {
        await createActivity.mutateAsync(payload);
        toast({ title: `${titleCaseLabel} created` });
      }

      resetBuilderState();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: editingActivity
          ? `Could not update ${activityLabel}`
          : `Could not create ${activityLabel}`,
        description:
          err instanceof ApiError || err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleSaveFeedback = async () => {
    const trimmedPrompt = feedbackDraft.prompt.trim();
    const cleanedFields = feedbackDraft.fields
      .map((field) => ({
        ...field,
        label: field.label.trim(),
      }))
      .filter((field) => field.label.length > 0);

    if (!trimmedPrompt) {
      toast({
        variant: 'destructive',
        title: 'Feedback prompt is required',
      });
      return;
    }

    if (cleanedFields.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Add at least one feedback field',
      });
      return;
    }

    await handleSaveActivity({
      type: 'feedback',
      title: trimmedPrompt,
      config: {
        prompt: trimmedPrompt,
        fields: cleanedFields,
        timeLimitSec: feedbackDraft.timeLimitSec,
      },
    } as CreateActivityPayload);
  };

  const openCreateBuilder = (type: BuilderType) => {
    setEditingActivity(null);
    setBuilderType(type);
    setFeedbackDraft(defaultFeedbackConfig);
    setBuilderOpen(true);
  };

  const openEditBuilder = (activity: Activity) => {
    setEditingActivity(activity);
    if (activity.type === 'quiz') {
      setBuilderType('quiz');
      setFeedbackDraft(defaultFeedbackConfig);
    } else if (activity.type === 'feedback' && isFeedbackConfig(activity.config)) {
      setBuilderType('feedback');
      setFeedbackDraft(activity.config);
    } else if (activity.type === 'wordcloud') {
      setBuilderType('wordcloud');
      setFeedbackDraft(defaultFeedbackConfig);
    } else {
      setBuilderType('poll');
      setFeedbackDraft(defaultFeedbackConfig);
    }
    setBuilderOpen(true);
  };

  const handleModerateQuestion = (
    questionId: string,
    status: 'approved' | 'dismissed' | 'answered',
  ) => {
    try {
      setIsModerating(true);
      moderateQuestion({ questionId, status });

      toast({
        title:
          status === 'approved'
            ? 'Question approved'
            : status === 'answered'
              ? 'Question marked answered'
              : 'Question dismissed',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not update question',
        description:
          err instanceof ApiError || err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsModerating(false);
    }
  };

  const handleReplyQuestion = (questionId: string, answerText: string) => {
    try {
      setIsModerating(true);
      replyQuestion({ questionId, answerText });

      toast({ title: 'Reply sent' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not send reply',
        description:
          err instanceof ApiError || err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsModerating(false);
    }
  };

  const handleDeleteActivity = (activity: Activity) => {
    const meta = ACTIVITY_TYPE_META[activity.type as BuilderType];
    const label = meta?.label ?? 'Activity';

    deleteActivity.mutate(activity._id, {
      onSuccess: () => {
        toast({ title: `${label} deleted` });
      },
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: `Could not delete ${label.toLowerCase()}`,
          description:
            err instanceof ApiError || err instanceof Error ? err.message : 'Unknown error',
        });
      },
    });
  };

  const renderActivityRunPanel = (activity: Activity) => {
    if (activity.type === 'quiz') {
      return <QuizRunPanel activity={activity} eventId={id} />;
    }

    if (activity.type === 'feedback') {
      return <FeedbackRunPanel activity={activity} />;
    }

    if (activity.type === 'wordcloud') {
      return <WordCloudRunPanel activity={activity} />;
    }

    return <PollRunPanel activity={activity} />;
  };

  const renderActivityCard = (activity: Activity) => {
    const type = activity.type as BuilderType;
    const meta = ACTIVITY_TYPE_META[type] ?? ACTIVITY_TYPE_META.poll;
    const Icon = meta.icon;

    return (
      <div
        key={activity._id}
        className="group overflow-hidden rounded-lg border border-border bg-surface-card shadow-xs transition duration-base ease-standard hover:border-brand/40 hover:shadow-md"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface-raised px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                <StatusBadge status={activity.status} className="capitalize" />
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {meta.label} - {meta.description}
              </p>
            </div>
          </div>

          <ActionGroup className="justify-start">
            <Link href={`/dashboard/events/${id}/analytics`}>
              <Button variant="ghost" size="sm">
                <BarChart2 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => openEditBuilder(activity)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteActivity.isPending || activity.status === 'live'}
              onClick={() => handleDeleteActivity(activity)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </ActionGroup>
        </div>

        <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
          {renderActivityRunPanel(activity)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="text" className="h-5 w-36" />
        <LoadingSkeleton variant="card" className="h-36" />
        <div className="grid gap-4 md:grid-cols-3">
          <LoadingSkeleton variant="card" className="h-28" />
          <LoadingSkeleton variant="card" className="h-28" />
          <LoadingSkeleton variant="card" className="h-28" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-4">
        <BackLink href="/dashboard">Back to events</BackLink>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Could not load this event</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Event not found'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const editingPollConfig =
    editingActivity && editingActivity.type === 'poll' && isPollConfig(editingActivity.config)
      ? {
          ...editingActivity.config,
          title: editingActivity.title,
        }
      : undefined;

  const editingQuizConfig =
    editingActivity && editingActivity.type === 'quiz' && isQuizConfig(editingActivity.config)
      ? {
          ...editingActivity.config,
          title: editingActivity.title,
        }
      : undefined;

  const editingWordCloudConfig =
    editingActivity &&
    editingActivity.type === 'wordcloud' &&
    isWordCloudConfig(editingActivity.config)
      ? {
          ...editingActivity.config,
          title: editingActivity.title,
        }
      : undefined;

  return (
    <div className="space-y-7">
      <PageHeader
        leading={<BackLink href="/dashboard">Back to events</BackLink>}
        eyebrow="Event workspace"
        title={event.name}
        description={event.description}
        badge={
          scheduledStatus.scheduled ? (
            <div className="flex gap-2">
              <StatusBadge status={event.status} className="capitalize" />
              {scheduledStatus.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  <LiveDot sizeClass="h-1.5 w-1.5" />
                  Live Now
                </span>
              )}
              {scheduledStatus.status === 'upcoming' && (
                <span className="inline-flex items-center rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-semibold text-ink-secondary">
                  🟡 {scheduledStatus.countdown}
                </span>
              )}
              {scheduledStatus.status === 'past' && (
                <span className="inline-flex items-center rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                  ⚪ Ended
                </span>
              )}
            </div>
          ) : (
            <StatusBadge status={event.status} className="capitalize" />
          )
        }
        actions={
          <ActionGroup>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEndSession}
              disabled={isEndingSession || event.status === 'ended'}
            >
              <Square className="h-4 w-4" />
              {isEndingSession
                ? 'Ending…'
                : event.status === 'ended'
                  ? 'Session ended'
                  : 'End session'}
            </Button>
            {event.status === 'ended' && (
              <Link href={`/dashboard/events/${id}/analytics`}>
                <Button variant="default" size="sm">
                  <BarChart2 className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </ActionGroup>
        }
      />

      <SurfacePanel tone="raised" className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Join code</p>
          <JoinCode code={event.eventCode} size="sm" className="mt-2" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</p>
          <div className="mt-2">
            <StatusBadge status={event.status} className="capitalize" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Activities
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
            {activities.length}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Live participants
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
            {liveCount}
          </p>
        </div>
      </SurfacePanel>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface-card p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeTab === 'overview'
              ? 'bg-brand-subtle text-brand-subtle-text'
              : 'text-ink-muted hover:bg-surface-sunken hover:text-foreground',
          )}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('polls')}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeTab === 'polls'
              ? 'bg-brand-subtle text-brand-subtle-text'
              : 'text-ink-muted hover:bg-surface-sunken hover:text-foreground',
          )}
        >
          Activities (
          {pollActivities.length +
            quizActivities.length +
            feedbackActivities.length +
            wordcloudActivities.length}
          )
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeTab === 'qa'
              ? 'bg-brand-subtle text-brand-subtle-text'
              : 'text-ink-muted hover:bg-surface-sunken hover:text-foreground',
          )}
        >
          Q&amp;A ({pendingQuestions.length + approvedQuestions.length + answeredQuestions.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {event.status === 'ended' ? (
            <SurfacePanel tone="brand">
              <SectionHeader
                eyebrow="Session complete"
                title="Analytics available"
                description="Your session has ended. View the full analytics report including polls, quizzes, word clouds, feedback, and Q&A."
                actions={
                  <Link href={`/dashboard/events/${id}/analytics`}>
                    <Button>
                      <BarChart2 className="h-4 w-4" />
                      View Analytics Report
                    </Button>
                  </Link>
                }
              />
            </SurfacePanel>
          ) : (
            <MetricCard
              className="border-brand/30 bg-brand-subtle/40"
              label="Live participants"
              value={liveCount}
              description={`${liveCount === 1 ? 'person connected' : 'people connected'} - updates in real time`}
              icon={<LiveDot />}
              trend={<ConnectionStatus />}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Join code</CardTitle>
                <CardDescription>Your audience enters this at the join page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center rounded-lg bg-surface-sunken py-8">
                  <JoinCode code={event.eventCode} size="lg" />
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md border border-border bg-surface-card px-3 py-2 text-xs text-ink-muted">
                    {qr?.joinUrl ?? 'Generating link…'}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!qr?.joinUrl}
                    aria-label="Copy join link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">QR code</CardTitle>
                <CardDescription>Scan to join from a phone.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {qr?.qrDataUrl ? (
                  <Image
                    src={qr.qrDataUrl}
                    alt={`QR code to join ${event.name}`}
                    width={220}
                    height={220}
                    unoptimized
                    className="rounded-md border border-border"
                  />
                ) : (
                  <LoadingSkeleton className="h-[220px] w-[220px] rounded-md border border-border" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'polls' && (
        <div className="space-y-5">
          <SectionHeader
            title="Activities"
            description="Create and run polls, quizzes, feedback forms, and word clouds for this event."
            actions={
              <ActionGroup>
                <Button variant="outline" onClick={() => openCreateBuilder('poll')}>
                  <Plus className="h-4 w-4" />
                  New poll
                </Button>
                <Button variant="outline" onClick={() => openCreateBuilder('feedback')}>
                  <Plus className="h-4 w-4" />
                  New feedback
                </Button>
                <Button variant="outline" onClick={() => openCreateBuilder('wordcloud')}>
                  <Plus className="h-4 w-4" />
                  New word cloud
                </Button>
                <Button onClick={() => openCreateBuilder('quiz')}>
                  <Plus className="h-4 w-4" />
                  New quiz
                </Button>
              </ActionGroup>
            }
          />

          {activitiesLoading ? (
            <div className="space-y-3">
              <LoadingSkeleton variant="card" className="h-44" />
              <LoadingSkeleton variant="card" className="h-44" />
            </div>
          ) : pollActivities.length === 0 &&
            quizActivities.length === 0 &&
            feedbackActivities.length === 0 &&
            wordcloudActivities.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                title="Add your first activity"
                description="Pick an activity type to run live with your audience."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ActivityTile
                  type="poll"
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="Poll"
                  description="Ask a question and watch the bars fill in real time."
                  onClick={() => openCreateBuilder('poll')}
                />
                <ActivityTile
                  type="quiz"
                  icon={<ListChecks className="h-5 w-5" />}
                  title="Quiz"
                  description="Score answers and rank your audience on a leaderboard."
                  onClick={() => openCreateBuilder('quiz')}
                />
                <ActivityTile
                  type="wordcloud"
                  icon={<Cloud className="h-5 w-5" />}
                  title="Word cloud"
                  description="Collect words and let popular ones grow on screen."
                  onClick={() => openCreateBuilder('wordcloud')}
                />
                <ActivityTile
                  type="feedback"
                  icon={<Star className="h-5 w-5" />}
                  title="Feedback"
                  description="Gather ratings and open comments after the session."
                  onClick={() => openCreateBuilder('feedback')}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => renderActivityCard(activity))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'qa' && (
        <QuestionModerationPanel
          pendingQuestions={pendingQuestions}
          approvedQuestions={approvedQuestions}
          answeredQuestions={answeredQuestions}
          onApprove={(questionId) => handleModerateQuestion(questionId, 'approved')}
          onDismiss={(questionId) => handleModerateQuestion(questionId, 'dismissed')}
          onReply={handleReplyQuestion}
          isUpdating={isModerating}
        />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
            <DialogDescription>Update the name, description, or settings.</DialogDescription>
          </DialogHeader>
          <EventForm
            submitLabel="Save changes"
            isSubmitting={updateEvent.isPending}
            defaultValues={{
              name: event.name,
              description: event.description ?? '',
              settings: event.settings,
            }}
            onCancel={() => setEditOpen(false)}
            onSubmit={(values) => {
              updateEvent.mutate(values, {
                onSuccess: () => {
                  toast({ title: 'Event updated' });
                  setEditOpen(false);
                },
                onError: (err) => {
                  toast({
                    variant: 'destructive',
                    title: 'Could not update event',
                    description:
                      err instanceof ApiError || err instanceof Error
                        ? err.message
                        : 'Unknown error',
                  });
                },
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={builderOpen}
        onOpenChange={(open) => {
          setBuilderOpen(open);
          if (!open) {
            resetBuilderState();
          }
        }}
      >
        <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden border-border bg-surface-card p-0">
          <DialogHeader className="shrink-0 border-b border-border bg-surface-raised px-6 py-5">
            <DialogTitle className="font-display text-xl">
              {`${editingActivity ? 'Edit' : 'Create'} ${
                builderType === 'quiz'
                  ? 'quiz'
                  : builderType === 'feedback'
                    ? 'feedback'
                    : builderType === 'wordcloud'
                      ? 'word cloud'
                      : 'poll'
              }`}
            </DialogTitle>
            <DialogDescription className="text-ink-secondary">
              {builderType === 'quiz'
                ? 'Configure a timed quiz with correct answers, points, and timers.'
                : builderType === 'feedback'
                  ? 'Configure a feedback form with rating and text fields.'
                  : builderType === 'wordcloud'
                    ? 'Configure a live word cloud prompt for this event.'
                    : 'Configure a live poll for this event.'}
            </DialogDescription>
          </DialogHeader>

          {!editingActivity && (
            <div className="mx-6 mt-5 shrink-0 grid gap-2 rounded-lg border border-border bg-surface-sunken p-1 sm:grid-cols-4">
              <Button
                type="button"
                variant={builderType === 'poll' ? 'default' : 'ghost'}
                onClick={() => setBuilderType('poll')}
                className="justify-center"
              >
                <BarChart3 className="h-4 w-4" />
                Poll
              </Button>
              <Button
                type="button"
                variant={builderType === 'feedback' ? 'default' : 'ghost'}
                onClick={() => setBuilderType('feedback')}
                className="justify-center"
              >
                <Star className="h-4 w-4" />
                Feedback
              </Button>
              <Button
                type="button"
                variant={builderType === 'wordcloud' ? 'default' : 'ghost'}
                onClick={() => setBuilderType('wordcloud')}
                className="justify-center"
              >
                <Cloud className="h-4 w-4" />
                Word cloud
              </Button>
              <Button
                type="button"
                variant={builderType === 'quiz' ? 'default' : 'ghost'}
                onClick={() => setBuilderType('quiz')}
                className="justify-center"
              >
                <ListChecks className="h-4 w-4" />
                Quiz
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 pb-0 pt-5">
            {builderType === 'quiz' ? (
              <QuizBuilder
                eventId={id}
                initialConfig={editingQuizConfig}
                onSave={handleSaveActivity}
                onCancel={resetBuilderState}
                isSaving={createActivity.isPending || updateActivity.isPending}
              />
            ) : builderType === 'wordcloud' ? (
              <WordCloudBuilder
                eventId={id}
                initialConfig={editingWordCloudConfig}
                onSave={handleSaveActivity}
                onCancel={resetBuilderState}
                isSaving={createActivity.isPending || updateActivity.isPending}
              />
            ) : builderType === 'feedback' ? (
              <div className="space-y-6">
                <FeedbackBuilder
                  value={feedbackDraft}
                  onChange={setFeedbackDraft}
                  disabled={createActivity.isPending || updateActivity.isPending}
                />

                <ActionGroup className="sticky bottom-0 -mx-1 border-t border-border bg-background/95 px-1 pb-5 pt-4 backdrop-blur">
                  <Button type="button" variant="ghost" onClick={resetBuilderState}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveFeedback}
                    disabled={createActivity.isPending || updateActivity.isPending}
                    loading={createActivity.isPending || updateActivity.isPending}
                  >
                    {createActivity.isPending || updateActivity.isPending
                      ? 'Saving…'
                      : editingActivity
                        ? 'Save changes'
                        : 'Create feedback'}
                  </Button>
                </ActionGroup>
              </div>
            ) : (
              <PollBuilder
                eventId={id}
                initialConfig={editingPollConfig}
                onSave={handleSaveActivity}
                onCancel={resetBuilderState}
                isSaving={createActivity.isPending || updateActivity.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              This permanently deletes “{event.name}”. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <ActionGroup>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteEvent.isPending}
              onClick={() =>
                deleteEvent.mutate(id, {
                  onSuccess: () => {
                    toast({ title: 'Event deleted' });
                    router.push('/dashboard');
                  },
                  onError: (err) => {
                    toast({
                      variant: 'destructive',
                      title: 'Could not delete event',
                      description:
                        err instanceof ApiError || err instanceof Error
                          ? err.message
                          : 'Unknown error',
                    });
                  },
                })
              }
            >
              {deleteEvent.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </ActionGroup>
        </DialogContent>
      </Dialog>
    </div>
  );
}
