'use client';

import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EventStatusBadge } from '@/components/event-status-badge';
import { useEvents } from '@/lib/use-events';

export default function DashboardPage() {
  const { data: events, isLoading, isError, error } = useEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your events</h1>
          <p className="text-sm text-muted-foreground">
            Create an event, then share its code or QR with participants.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create event
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Could not load events
            </CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Unknown error'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !isError && events?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No events yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first event to get a join code and QR.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Create event
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && events && events.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <Link key={event._id} href={`/dashboard/events/${event._id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <EventStatusBadge status={event.status} />
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <span className="font-mono text-sm tracking-widest text-muted-foreground">
                    {event.eventCode}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
