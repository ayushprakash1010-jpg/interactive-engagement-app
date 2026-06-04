'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Copy, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from '@/hooks/use-activities';
import { PollBuilder } from '@/components/poll/poll-builder';
import { PollRunPanel } from '@/components/poll/poll-run-panel';

type Tab = 'overview' | 'polls';

function isPollConfig(config: Activity['config']): config is PollConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'pollType' in config &&
    'question' in config
  );
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const { data: event, isLoading, isError, error } = useEvent(id);
  const { data: qr } = useEventQr(id);

  const { count: liveCount } = useEventRealtime(event?.eventCode, 'observe');

  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();

  const { data: activities = [], isLoading: activitiesLoading } = useActivities(id);
  const createActivity = useCreateActivity(id);
  const updateActivity = useUpdateActivity(id);
  const deleteActivity = useDeleteActivity(id);

  const [activeTab, setActiveTab] = React.useState<Tab>('overview');
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<Activity | null>(null);
  const [copied, setCopied] = React.useState(false);

  const pollActivities = activities.filter((activity) => activity.type === 'poll');

  const handleCopy = async () => {
    if (!qr?.joinUrl) return;
    await navigator.clipboard.writeText(qr.joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveActivity = async (payload: CreateActivityPayload) => {
    try {
      if (editingActivity) {
        await updateActivity.mutateAsync({
          activityId: editingActivity._id,
          payload: {
            title: payload.title,
            config: payload.config,
          },
        });

        toast({ title: 'Poll updated' });
      } else {
        await createActivity.mutateAsync(payload);
        toast({ title: 'Poll created' });
      }

      setBuilderOpen(false);
      setEditingActivity(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: editingActivity ? 'Could not update poll' : 'Could not create poll',
        description:
          err instanceof ApiError || err instanceof Error
            ? err.message
            : 'Unknown error',
      });
    }
  };

  const openCreateBuilder = () => {
    setEditingActivity(null);
    setBuilderOpen(true);
  };

  const openEditBuilder = (activity: Activity) => {
    setEditingActivity(activity);
    setBuilderOpen(true);
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border bg-muted/40" />;
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

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2">
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

      <div className="flex items-center gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('polls')}
          className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'polls'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Polls ({pollActivities.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Live participants</CardTitle>
                <CardDescription>
                  Updates in real time as people join and leave.
                </CardDescription>
              </div>
              <ConnectionStatus />
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold tabular-nums">{liveCount}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {liveCount === 1 ? 'person connected' : 'people connected'}
              </span>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Join code</CardTitle>
                <CardDescription>
                  Participants enter this at the join page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted py-6 text-center">
                  <span className="font-mono text-5xl font-bold tracking-[0.3em]">
                    {event.eventCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
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
                      <Check className="h-4 w-4 text-green-600" />
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
                    className="rounded-md border"
                  />
                ) : (
                  <div className="h-[220px] w-[220px] animate-pulse rounded-md border bg-muted/40" />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'polls' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateBuilder}>
              <Plus className="mr-2 h-4 w-4" />
              New poll
            </Button>
          </div>

          {activitiesLoading ? (
            <div className="h-40 animate-pulse rounded-lg border bg-muted/40" />
          ) : pollActivities.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No polls yet</CardTitle>
                <CardDescription>
                  Create your first poll to run live with participants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={openCreateBuilder}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create first poll
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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
            </div>
          )}
        </div>
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
          if (!open) setEditingActivity(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Edit poll' : 'Create poll'}
            </DialogTitle>
            <DialogDescription>
              Configure a live poll for this event.
            </DialogDescription>
          </DialogHeader>
          <PollBuilder
            eventId={id}
            initialConfig={editingPollConfig}
            onSave={handleSaveActivity}
            onCancel={() => {
              setBuilderOpen(false);
              setEditingActivity(null);
            }}
            isSaving={createActivity.isPending || updateActivity.isPending}
          />
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
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back to events
    </Link>
  );
}