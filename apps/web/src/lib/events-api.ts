import type { Event, CreateEvent, UpdateEvent } from '@iep/types';

/**
 * Client-side API surface. Every call goes through the same-origin
 * /api/proxy/* route, which attaches the Auth0 Bearer token server-side
 * before forwarding to the NestJS API.
 */
const PROXY_BASE = '/api/proxy';

export type EventQr = {
  eventCode: string;
  joinUrl: string;
  qrDataUrl: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PROXY_BASE}/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const eventsApi = {
  list: () => apiFetch<Event[]>('events'),

  get: (id: string) => apiFetch<Event>(`events/${id}`),

  getQr: (id: string) => apiFetch<EventQr>(`events/${id}/qr`),

  create: (dto: CreateEvent) =>
    apiFetch<Event>('events', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: UpdateEvent) =>
    apiFetch<Event>(`events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  remove: (id: string) =>
    apiFetch<void>(`events/${id}`, {
      method: 'DELETE',
    }),
};
