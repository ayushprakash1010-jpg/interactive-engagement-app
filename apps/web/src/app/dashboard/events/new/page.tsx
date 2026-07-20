'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, LayoutTemplate, FilePlus2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EventForm } from '@/components/event-form';
import { Eyebrow } from '@/components/pulse';
import { useCreateEvent } from '@/lib/use-events';
import { useToast } from '@/components/ui/use-toast';
import { ApiError, apiFetch } from '@/lib/events-api';
import { notify } from '@/lib/notification-store';
import { TemplateGallery } from '@/components/templates/template-gallery';
import type { EventTemplate } from '@/lib/templates';
import type { Activity } from '@/hooks/use-activities';
import { useAuth } from '@/lib/use-auth';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

type CreationMode = 'select' | 'blank' | 'template';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createEvent = useCreateEvent();
  const [mode, setMode] = React.useState<CreationMode>('select');
  const [creatingTemplateId, setCreatingTemplateId] = React.useState<string | null>(null);
  const { user } = useAuth();

  const handleCreateFromTemplate = async (template: EventTemplate) => {
    try {
      setCreatingTemplateId(template.id);
      
      // 1. Create the event
      let createdEvent;
      try {
        createdEvent = await createEvent.mutateAsync({
          name: template.name,
          description: template.description,
          settings: template.settings,
        });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Could not create event',
          description:
            err instanceof ApiError || err instanceof Error
              ? err.message
              : 'Unknown error',
        });
        setCreatingTemplateId(null);
        return; // Stop if event creation fails
      }

      // 2. Create activities sequentially and handle partial failures
      let failedActivities = 0;
      for (const activityPayload of template.activities) {
        try {
          await apiFetch<Activity>(`events/${createdEvent._id}/activities`, {
            method: 'POST',
            body: JSON.stringify(activityPayload),
          });
        } catch (err) {
          failedActivities++;
          console.error('Failed to create activity:', err);
        }
      }

      // 3. Notify and navigate
      if (failedActivities > 0) {
        toast({
          variant: 'destructive',
          title: 'Event created partially',
          description: `${failedActivities} activit${failedActivities === 1 ? 'y' : 'ies'} could not be created. You can add them manually.`,
        });
      } else {
        toast({ title: 'Event created', description: `${template.name} is ready.` });
      }
      
      notify({
        type: 'event-created',
        description: `${createdEvent.name} was created from a template.`,
        href: `/dashboard/events/${createdEvent._id}`,
      });
      
      router.push(`/dashboard/events/${createdEvent._id}`);
    } catch (err) {
      // Fallback catch
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Please try again.',
      });
      setCreatingTemplateId(null);
    }
  };

  if (mode === 'select') {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-ink-muted transition-colors hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Link>
          
          <Eyebrow>New Event</Eyebrow>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            How would you like to start?
          </h1>
          <p className="mt-2 text-lg text-ink-muted">
            Choose a starting point for your next interactive session.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Blank Event */}
          <Card 
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer overflow-hidden transition-all hover:border-brand/40 hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => setMode('blank')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMode('blank');
              }
            }}
          >
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised text-foreground transition-colors group-hover:bg-brand-subtle group-hover:text-brand">
                <FilePlus2 className="h-6 w-6" />
              </div>
              <CardTitle>Blank Event</CardTitle>
              <CardDescription>
                Start from scratch. Build your event manually with your own settings and activities.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Template */}
          <Card 
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer overflow-hidden transition-all hover:border-brand/40 hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => setMode('template')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMode('template');
              }
            }}
          >
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised text-foreground transition-colors group-hover:bg-brand-subtle group-hover:text-brand">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <CardTitle>Start from Template</CardTitle>
              <CardDescription>
                Save time with pre-built sessions designed for meetings, classes, and town halls.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Generate with AI */}
          <Card 
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer overflow-hidden transition-all hover:border-ai/40 hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ai"
            onClick={() => router.push('/dashboard/ai')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push('/dashboard/ai');
              }
            }}
          >
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised text-foreground transition-colors group-hover:bg-ai/10 group-hover:text-ai">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle>Generate with AI ✨</CardTitle>
              <CardDescription>
                Let our AI create a fully fleshed-out event tailored to your specific topic and audience.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.isImpersonating) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 mt-8">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Restricted Action</h2>
          <p className="text-muted-foreground max-w-[400px]">
            You cannot create new events while impersonating another user. This restriction protects the workspace data integrity.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/dashboard/events">Back to Events</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'template') {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => setMode('select')}
          className="inline-flex items-center text-sm text-ink-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to options
        </button>
        <TemplateGallery 
          onSelectTemplate={handleCreateFromTemplate} 
          isCreating={createEvent.isPending || creatingTemplateId !== null} 
          creatingTemplateId={creatingTemplateId}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <button
        onClick={() => setMode('select')}
        className="inline-flex items-center text-sm text-ink-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to options
      </button>

      <Card>
        <CardHeader>
          <Eyebrow>New event</Eyebrow>
          <CardTitle className="font-display text-xl">Create event</CardTitle>
          <CardDescription>
            Give your event a name and choose how your audience interacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            submitLabel="Create event"
            isSubmitting={createEvent.isPending}
            onCancel={() => setMode('select')}
            onSubmit={(values) => {
              createEvent.mutate(values, {
                onSuccess: (created) => {
                  toast({ title: 'Event created', description: created.name });
                  notify({
                    type: 'event-created',
                    description: `${created.name} was created.`,
                    href: `/dashboard/events/${created._id}`,
                  });
                  router.push(`/dashboard/events/${created._id}`);
                },
                onError: (err) => {
                  toast({
                    variant: 'destructive',
                    title: 'Could not create event',
                    description:
                      err instanceof ApiError || err instanceof Error
                        ? err.message
                        : 'Unknown error',
                  });
                },
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
