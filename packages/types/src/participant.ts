import { z } from 'zod';
import { anonId, isoDate, objectId } from './common.js';

/** Anonymous, per-session. No login; `anonId` is stored client-side. */
export const participantSchema = z.object({
  _id: objectId,
  eventId: objectId,
  anonId,
  displayName: z.string().max(80).optional(),
  firstSeenAt: isoDate,
  lastSeenAt: isoDate,
});
export type Participant = z.infer<typeof participantSchema>;

/** Payload sent by a participant on event:join. */
export const joinEventSchema = z.object({
  eventCode: z.string().length(6),
  anonId,
  displayName: z.string().max(80).optional(),
});
export type JoinEvent = z.infer<typeof joinEventSchema>;
