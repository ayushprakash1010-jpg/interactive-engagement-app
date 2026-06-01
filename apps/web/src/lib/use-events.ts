'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Event, CreateEvent, UpdateEvent } from '@iep/types';
import { eventsApi } from './events-api';

/** Query keys kept in one place so mutations can invalidate precisely. */
export const eventKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
  qr: (id: string) => ['events', id, 'qr'] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.all,
    queryFn: eventsApi.list,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  });
}

export function useEventQr(id: string) {
  return useQuery({
    queryKey: eventKeys.qr(id),
    queryFn: () => eventsApi.getQr(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEvent) => eventsApi.create(dto),
    onSuccess: (created) => {
      // Seed the detail cache and refresh the list.
      qc.setQueryData(eventKeys.detail(created._id), created);
      void qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateEvent) => eventsApi.update(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData(eventKeys.detail(id), updated);
      void qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(id),
    // Optimistically drop the event from the cached list.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: eventKeys.all });
      const previous = qc.getQueryData<Event[]>(eventKeys.all);
      qc.setQueryData<Event[]>(eventKeys.all, (old) =>
        old?.filter((e) => e._id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(eventKeys.all, ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
