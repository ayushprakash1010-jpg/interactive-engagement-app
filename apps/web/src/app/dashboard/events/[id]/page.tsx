'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
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
import { Button } from '@/components/ui/button';
import { Eyebrow, JoinCode, LiveDot, ActivityTile } from '@/components/pulse';
import { cn } from '@/lib/utils';
import { QuizRunPanel } from '@/components/poll/quiz-run-panel';
import { FeedbackRunPanel } from '@/components/poll/feedback-run-panel';
import { WordCloudRunPanel } from '@/components/poll/wordcloud-run-panel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/event-form';
import { EventStatusBadge } from '@/components/event-status-badge';
import { ConnectionStatus } from '@/components/connection-status';
import { useToast } from '@/components/ui/use-toast';
import { useEventRealtime } from '@/lib/use-event-realtime';
import { QuestionModerationPanel } from '@/components/questions/question-moderation-panel';
import {
  useEvent,
  useEventQr,
  useUpdateEvent,
  useDeleteEvent,
} from '@/lib/use-events';
import { ApiError } from '@/lib/events-api';
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
import { PollBuilder } from '@/components/poll/poll-builder';
import { QuizBuilder } from '@/components/poll/quiz-builder';
import { PollRunPanel } from '@/components/poll/poll-run-panel';
import { WordCloudBuilder } from '@/components/poll/wordcloud-builder';
import {
  FeedbackBuilder,
  type FeedbackConfig,
} from '@/components/poll/feedback-builder';

type Tab = 'overview' | 'polls' | 'qa';
type BuilderType = 'poll' | 'quiz' | 'feedback' | 'wordcloud';

function isPollConfig(config: Activity['config']): config is PollConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'pollType' in config &&
    'question' in config
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

const defaultFeedbackConfig: FeedbackConfig = {
  prompt: '',
  fields: [],
};

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
  } = useEventRealtime(event?.eventCode, 'observe', { eventId: id });

  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();

  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(id);
  const createActivity = useCreateActivity(id);
  const updateActivity = useUpdateActivity(id);
  const deleteActivity = useDeleteActivity(id);

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
  const [feedbackDraft, setFeedbackDraft] =
    React.useState<FeedbackConfig>(defaultFeedbackConfig);

  const pollActivities = activities.filter((activity) => activity.type === 'poll');
  const quizActivities = activities.filter((activity) => activity.type === 'quiz');
  const feedbackActivities = activities.filter((activity) => activity.type === 'feedback');
  const wordcloudActivities = activities.filter(
    (activity) => activity.type === 'wordcloud',
  );

  const pendingQuestions = React.useMemo(
    () =>
      [...allQuestions]
        .filter((question) => question.status === 'pending')
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
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
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
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
          err instanceof ApiError || err instanceof Error
            ? err.message
            : 'Unknown error',
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
          err instanceof ApiError || err instanceof Error
            ? err.message
            : 'Unknown error',
      });
    } finally {
      setIsModerating(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-sunken" />;
  }

  if (isError || !event) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Could not load this event
            </CardTitle>
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
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {event.name}
            </h1>
            <EventStatusBadge status={event.status} />
          </div>
          {event.description && (
            <p className="text-sm text-ink-secondary">{event.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEndSession}
            disabled={isEndingSession || event.status === 'ended'}
          >
            <Square className="mr-2 h-4 w-4" />
            {isEndingSession ? 'Ending…' : event.status === 'ended' ? 'Session ended' : 'End session'}
          </Button>
          {event.status === 'ended' && (
            <Link href={`/dashboard/events/${id}/analytics`}>
              <Button variant="default" size="sm">
                <BarChart2 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={cn(
            '-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'overview'
              ? 'border-brand text-foreground'
              : 'border-transparent text-ink-muted hover:text-foreground',
          )}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('polls')}
          className={cn(
            '-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'polls'
              ? 'border-brand text-foreground'
              : 'border-transparent text-ink-muted hover:text-foreground',
          )}
        >
          Activities ({pollActivities.length + quizActivities.length + feedbackActivities.length + wordcloudActivities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={cn(
            '-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'qa'
              ? 'border-brand text-foreground'
              : 'border-transparent text-ink-muted hover:text-foreground',
          )}
        >
          Q&amp;A ({pendingQuestions.length + approvedQuestions.length + answeredQuestions.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {event.status === 'ended' ? (
            <Card className="border-brand/30 bg-brand-subtle/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div>
                    <Eyebrow>Session complete</Eyebrow>
                    <CardTitle className="text-base">Analytics available</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-secondary mb-4">
                  Your session has ended. View the full analytics report including polls, quizzes, word clouds, feedback, and Q&A.
                </p>
                <Link href={`/dashboard/events/${id}/analytics`}>
                  <Button>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Analytics Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-brand/30 bg-brand-subtle/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <LiveDot />
                  <div>
                    <Eyebrow>Live now</Eyebrow>
                    <CardTitle className="text-base">Live participants</CardTitle>
                  </div>
                </div>
                <ConnectionStatus />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold leading-none tracking-tight tabular-nums text-brand">
                    {liveCount}
                  </span>
                  <span className="text-sm text-ink-secondary">
                    {liveCount === 1 ? 'person connected' : 'people connected'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  Updates in real time as your audience joins and leaves.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Join code</CardTitle>
                <CardDescription>
                  Your audience enters this at the join page.
                </CardDescription>
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
                  <div className="h-[220px] w-[220px] animate-pulse rounded-md border border-border bg-surface-sunken" />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'polls' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => openCreateBuilder('poll')}>
              <Plus className="mr-2 h-4 w-4" />
              New poll
            </Button>
            <Button variant="outline" onClick={() => openCreateBuilder('feedback')}>
              <Plus className="mr-2 h-4 w-4" />
              New feedback
            </Button>
            <Button variant="outline" onClick={() => openCreateBuilder('wordcloud')}>
              <Plus className="mr-2 h-4 w-4" />
              New word cloud
            </Button>
            <Button onClick={() => openCreateBuilder('quiz')}>
              <Plus className="mr-2 h-4 w-4" />
              New quiz
            </Button>
          </div>

          {activitiesLoading ? (
            <div className="h-40 animate-pulse rounded-lg border border-border bg-surface-sunken" />
          ) : pollActivities.length === 0 &&
            quizActivities.length === 0 &&
            feedbackActivities.length === 0 &&
            wordcloudActivities.length === 0 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Eyebrow>Add your first activity</Eyebrow>
                <p className="text-sm text-ink-secondary">
                  Pick an activity type to run live with your audience.
                </p>
              </div>
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
            <div className="space-y-6">
              {pollActivities.map((activity) => (
                <div key={activity._id} className="space-y-3">
                  <PollRunPanel activity={activity} />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditBuilder(activity)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteActivity.isPending || activity.status === 'live'}
                      onClick={() =>
                        deleteActivity.mutate(activity._id, {
                          onSuccess: () => {
                            toast({ title: 'Poll deleted' });
                          },
                          onError: (err) => {
                            toast({
                              variant: 'destructive',
                              title: 'Could not delete poll',
                              description:
                                err instanceof ApiError || err instanceof Error
                                  ? err.message
                                  : 'Unknown error',
                            });
                          },
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {feedbackActivities.map((activity) => (
                <div key={activity._id} className="space-y-3">
                  <FeedbackRunPanel activity={activity} />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditBuilder(activity)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteActivity.isPending || activity.status === 'live'}
                      onClick={() =>
                        deleteActivity.mutate(activity._id, {
                          onSuccess: () => {
                            toast({ title: 'Feedback deleted' });
                          },
                          onError: (err) => {
                            toast({
                              variant: 'destructive',
                              title: 'Could not delete feedback',
                              description:
                                err instanceof ApiError || err instanceof Error
                                  ? err.message
                                  : 'Unknown error',
                            });
                          },
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {quizActivities.map((activity) => (
                <div key={activity._id} className="space-y-3">
                  <QuizRunPanel activity={activity} eventId={id} />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditBuilder(activity)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteActivity.isPending || activity.status === 'live'}
                      onClick={() =>
                        deleteActivity.mutate(activity._id, {
                          onSuccess: () => {
                            toast({ title: 'Quiz deleted' });
                          },
                          onError: (err) => {
                            toast({
                              variant: 'destructive',
                              title: 'Could not delete quiz',
                              description:
                                err instanceof ApiError || err instanceof Error
                                  ? err.message
                                  : 'Unknown error',
                            });
                          },
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {wordcloudActivities.map((activity) => (
                <div key={activity._id} className="space-y-3">
                  <WordCloudRunPanel activity={activity} />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditBuilder(activity)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteActivity.isPending || activity.status === 'live'}
                      onClick={() =>
                        deleteActivity.mutate(activity._id, {
                          onSuccess: () => {
                            toast({ title: 'Word cloud deleted' });
                          },
                          onError: (err) => {
                            toast({
                              variant: 'destructive',
                              title: 'Could not delete word cloud',
                              description:
                                err instanceof ApiError || err instanceof Error
                                  ? err.message
                                  : 'Unknown error',
                            });
                          },
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
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
          onMarkAnswered={(questionId) => handleModerateQuestion(questionId, 'answered')}
          isUpdating={isModerating}
        />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
            <DialogDescription>
              Update the name, description, or settings.
            </DialogDescription>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
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
            <DialogDescription>
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant={builderType === 'poll' ? 'default' : 'outline'}
                onClick={() => setBuilderType('poll')}
              >
                Poll
              </Button>
              <Button
                type="button"
                variant={builderType === 'feedback' ? 'default' : 'outline'}
                onClick={() => setBuilderType('feedback')}
              >
                Feedback
              </Button>
              <Button
                type="button"
                variant={builderType === 'wordcloud' ? 'default' : 'outline'}
                onClick={() => setBuilderType('wordcloud')}
              >
                Word cloud
              </Button>
              <Button
                type="button"
                variant={builderType === 'quiz' ? 'default' : 'outline'}
                onClick={() => setBuilderType('quiz')}
              >
                Quiz
              </Button>
            </div>
          )}

          <div className="max-h-[calc(90vh-10rem)] overflow-y-auto pr-1">
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

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetBuilderState}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveFeedback}
                    disabled={createActivity.isPending || updateActivity.isPending}
                  >
                    {createActivity.isPending || updateActivity.isPending
                      ? 'Saving…'
                      : editingActivity
                      ? 'Save changes'
                      : 'Create feedback'}
                  </Button>
                </div>
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
          <div className="flex justify-end gap-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center text-sm text-ink-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back to events
    </Link>
  );
}
