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
import { useCreateEvent } from '@/lib/use-events';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/lib/events-api';

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createEvent = useCreateEvent();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create event</CardTitle>
          <CardDescription>
            Give your event a name and choose how participants interact.
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
