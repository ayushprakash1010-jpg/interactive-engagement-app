import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiFetch } from '@/lib/events-api';

export interface PollConfig {
  pollType: 'single' | 'multiple' | 'rating' | 'open';
  question: string;
  options?: { id: string; label: string }[];
  ratingScale?: number;
}

export interface Activity {
  _id: string;
  eventId: string;
  type: 'poll' | 'quiz' | 'wordcloud' | 'feedback';
  title: string;
  order: number;
  status: 'idle' | 'live' | 'closed';
  config: PollConfig | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityPayload {
  type: 'poll' | 'quiz' | 'wordcloud' | 'feedback';
  title: string;
  config: PollConfig | Record<string, unknown>;
}

export interface UpdateActivityPayload {
  title?: string;
  config?: PollConfig | Record<string, unknown>;
}

export const activityKeys = {
  all: (eventId: string) => ['activities', eventId] as const,
  detail: (eventId: string, id: string) => ['activities', eventId, id] as const,
};

export function useActivities(eventId: string) {
  return useQuery({
    queryKey: activityKeys.all(eventId),
    queryFn: () => apiFetch<Activity[]>(`events/${eventId}/activities`),
    enabled: Boolean(eventId),
  });
}

export function useCreateActivity(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) =>
      apiFetch<Activity>(`events/${eventId}/activities`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.all(eventId) });
      const previous = queryClient.getQueryData<Activity[]>(
        activityKeys.all(eventId),
      );

      const optimistic: Activity = {
        _id: `optimistic_${Date.now()}`,
        eventId,
        type: payload.type,
        title: payload.title,
        order: previous?.length ?? 0,
        status: 'idle',
        config: payload.config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Activity[]>(activityKeys.all(eventId), (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(activityKeys.all(eventId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(eventId) });
    },
  });
}

export function useUpdateActivity(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      payload,
    }: {
      activityId: string;
      payload: UpdateActivityPayload;
    }) =>
      apiFetch<Activity>(`events/${eventId}/activities/${activityId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(eventId) });
    },
  });
}

export function useDeleteActivity(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      apiFetch<void>(`events/${eventId}/activities/${activityId}`, {
        method: 'DELETE',
      }),

    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.all(eventId) });
      const previous = queryClient.getQueryData<Activity[]>(
        activityKeys.all(eventId),
      );

      queryClient.setQueryData<Activity[]>(activityKeys.all(eventId), (old) =>
        (old ?? []).filter((a) => a._id !== activityId),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(activityKeys.all(eventId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(eventId) });
    },
  });
}

export function useReorderActivities(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiFetch<void>(`events/${eventId}/activities/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ orderedIds }),
      }),

    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.all(eventId) });
      const previous = queryClient.getQueryData<Activity[]>(
        activityKeys.all(eventId),
      );

      queryClient.setQueryData<Activity[]>(activityKeys.all(eventId), (old) => {
        if (!old) return old;
        const map = new Map(old.map((a) => [a._id, a]));
        return orderedIds
          .map((id, index) => {
            const activity = map.get(id);
            return activity ? { ...activity, order: index } : null;
          })
          .filter(Boolean) as Activity[];
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(activityKeys.all(eventId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all(eventId) });
    },
  });
}