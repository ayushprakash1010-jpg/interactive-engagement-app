import { z } from 'zod';
import { eventCode, objectId, timestamps } from './common.js';

export const eventStatus = z.enum(['draft', 'live', 'ended']);
export type EventStatus = z.infer<typeof eventStatus>;

export const eventSettingsSchema = z.object({
  allowAnonymousQA: z.boolean().default(true),
  requireModeration: z.boolean().default(false),
  participantNames: z.boolean().default(false),
});
export type EventSettings = z.infer<typeof eventSettingsSchema>;

export const eventSchema = z.object({
  _id: objectId,
  hostId: objectId,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  eventCode,
  status: eventStatus,
  settings: eventSettingsSchema,
  activeActivityId: objectId.nullable().default(null),
  startedAt: z.union([z.string().datetime(), z.date()]).nullable().optional(),
  endedAt: z.union([z.string().datetime(), z.date()]).nullable().optional(),
  ...timestamps,
});
export type Event = z.infer<typeof eventSchema>;

/** Body accepted by POST /events. */
export const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  settings: eventSettingsSchema.partial().optional(),
});
export type CreateEvent = z.infer<typeof createEventSchema>;

/** Body accepted by PATCH /events/:id. */
export const updateEventSchema = createEventSchema.partial().extend({
  status: eventStatus.optional(),
});
export type UpdateEvent = z.infer<typeof updateEventSchema>;
