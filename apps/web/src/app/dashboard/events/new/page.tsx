'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import { ApiError } from '@/lib/events-api';
import { notify } from '@/lib/notification-store';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createEvent = useCreateEvent();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-ink-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to events
      </Link>

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
            onCancel={() => router.push('/dashboard')}
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
