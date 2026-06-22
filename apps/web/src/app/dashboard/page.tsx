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
import { Eyebrow, JoinCode } from '@/components/pulse';
import { EventStatusBadge } from '@/components/event-status-badge';
import { useEvents } from '@/lib/use-events';

export default function DashboardPage() {
  const { data: events, isLoading, isError, error } = useEvents();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <Eyebrow>Your workspace</Eyebrow>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Your events
          </h1>
          <p className="text-sm text-ink-secondary">
            Create an event, then share its code or QR with your audience.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-border bg-surface-sunken"
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
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
              <Calendar className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-lg font-semibold text-foreground">
                No events yet
              </p>
              <p className="text-sm text-ink-secondary">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event._id} href={`/dashboard/events/${event._id}`}>
              <Card className="h-full transition-all duration-base ease-standard hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg">
                      {event.name}
                    </CardTitle>
                    <EventStatusBadge status={event.status} />
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2 rounded-md bg-surface-sunken px-3 py-2">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
                      Join code
                    </span>
                    <JoinCode code={event.eventCode} size="sm" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
