import { z } from 'zod';

/**
 * Zod schemas for inbound Socket.IO payloads (Sprint 7 security).
 *
 * These validate the SHAPE and BOUNDS of every client->server event so the
 * gateway can reject malformed/oversized payloads before touching the DB. They
 * are intentionally lenient on identifier FORMAT (anonId/eventCode are checked
 * for presence + length, not strict uuid/charset) so the realtime layer stays
 * tolerant of clients while still being bounded. Domain services apply stricter
 * rules (and sanitization) on the values that get persisted.
 */

const shortId = z.string().min(1).max(64);
const code = z.string().min(1).max(16);
const displayName = z.string().max(80).optional();

export const eventJoinSchema = z.object({
  eventCode: code,
  anonId: shortId,
  displayName,
});

export const eventObserveSchema = z.object({
  eventCode: code,
});

export const activityIdSchema = z.object({
  activityId: shortId,
});

export const activityRespondSocketSchema = z.object({
  activityId: shortId,
  anonId: shortId,
  selectedOptionIds: z.array(z.string().max(64)).max(100).optional(),
  textValue: z.string().max(2000).optional(),
  ratingValue: z.number().finite().optional(),
  feedbackAnswers: z
    .array(
      z.object({
        fieldId: z.string().min(1).max(64),
        type: z.enum(['rating', 'text']),
        ratingValue: z.number().finite().optional(),
        textValue: z.string().max(2000).optional(),
      }),
    )
    .max(50)
    .optional(),
});

export const wordCloudSubmitSchema = z.object({
  activityId: shortId,
  anonId: shortId,
  words: z.array(z.string().max(80)).max(50),
});

export const quizAnswerSchema = z.object({
  activityId: shortId,
  anonId: shortId,
  questionId: z.string().min(1).max(64),
  optionId: z.string().min(1).max(64),
  clientTimeMs: z.number().finite().optional(),
});

export const qaAskSchema = z.object({
  eventCode: code,
  anonId: shortId,
  text: z.string().min(1).max(1000),
  displayName,
});

export const qaUpvoteSchema = z.object({
  questionId: shortId,
  anonId: shortId,
});

export const qaModerateSchema = z.object({
  questionId: shortId,
  status: z.enum(['approved', 'dismissed', 'answered']),
});

export const sessionEndSchema = z.object({
  eventId: shortId,
});

export type EventJoinPayload = z.infer<typeof eventJoinSchema>;
export type EventObservePayload = z.infer<typeof eventObserveSchema>;
export type ActivityIdPayload = z.infer<typeof activityIdSchema>;
export type ActivityRespondSocketPayload = z.infer<
  typeof activityRespondSocketSchema
>;
export type WordCloudSubmitPayload = z.infer<typeof wordCloudSubmitSchema>;
export type QuizAnswerPayload = z.infer<typeof quizAnswerSchema>;
export type QaAskPayload = z.infer<typeof qaAskSchema>;
export type QaUpvotePayload = z.infer<typeof qaUpvoteSchema>;
export type QaModeratePayload = z.infer<typeof qaModerateSchema>;
export type SessionEndPayload = z.infer<typeof sessionEndSchema>;
