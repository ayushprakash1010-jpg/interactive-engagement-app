'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import {
  ActionGroup,
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
  PageHeader,
  SearchBar,
  StatusBadge,
} from '@/components/ui';
import { JoinCode } from '@/components/pulse';
import { useDeleteEvent, useEvents } from '@/lib/use-events';
import { useToast } from '@/components/ui/use-toast';
import { ApiError } from '@/lib/events-api';

export default function EventsPage() {
  const { data: events, isLoading, isError, error } = useEvents();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events?.filter((event) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      event.name.toLowerCase().includes(query) ||
      event.eventCode.toLowerCase().includes(query) ||
      (event.description ?? '').toLowerCase().includes(query)
    );
  });

  const handleDeleteEvent = () => {
    if (!eventToDelete) {
      return;
    }

    deleteEvent.mutate(eventToDelete.id, {
      onSuccess: () => {
        toast({ title: 'Event deleted' });
        setEventToDelete(null);
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
    });
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your workspace"
        title="Events"
        description="Create an event, then share its code or QR with your audience."
        actions={
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              Create event
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search events, descriptions, or codes"
          wrapperClassName="w-full sm:max-w-md"
        />
        <p className="text-sm text-ink-muted">
          {events?.length ?? 0} {events?.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} variant="card" className="h-40" />
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
        <EmptyState
          tone="brand"
          icon={<Calendar className="h-6 w-6" />}
          title="No events yet"
          description="Create your first event to get a join code and QR."
          action={
            <Button asChild>
              <Link href="/dashboard/events/new">
                <Plus className="h-4 w-4" />
                Create event
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading &&
        !isError &&
        events &&
        events.length > 0 &&
        filteredEvents?.length === 0 && (
          <EmptyState
            title="No matching events"
            description="Try a different event name, description, or join code."
          />
        )}

      {!isLoading && !isError && filteredEvents && filteredEvents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card
              key={event._id}
              className="group flex h-full flex-col overflow-hidden transition-all duration-base ease-standard hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
            >
              <Link href={`/dashboard/events/${event._id}`} className="flex flex-1 flex-col">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 font-display text-lg leading-tight transition-colors group-hover:text-brand">
                      {event.name}
                    </CardTitle>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={event.status} className="capitalize" />
                    </div>
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-sunken px-3 py-2">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
                      Join code
                    </span>
                    <JoinCode code={event.eventCode} size="sm" />
                  </div>
                </CardContent>
              </Link>
              <ActionGroup className="border-t border-border px-6 py-4" align="end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteEvent.isPending}
                  onClick={() =>
                    setEventToDelete({ id: event._id, name: event.name })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </ActionGroup>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={eventToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEventToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              This permanently deletes &ldquo;{eventToDelete?.name}&rdquo;. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <ActionGroup>
            <Button
              variant="outline"
              onClick={() => setEventToDelete(null)}
              disabled={deleteEvent.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteEvent.isPending}
              onClick={handleDeleteEvent}
            >
              {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </ActionGroup>
        </DialogContent>
      </Dialog>
    </div>
  );
}
