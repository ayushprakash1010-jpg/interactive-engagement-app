import { z } from 'zod';
import { anonId, isoDate, objectId } from './common.js';

/** Poll/quiz/feedback/wordcloud submissions. */
export const responseSchema = z.object({
  _id: objectId,
  eventId: objectId,
  activityId: objectId,
  participantAnonId: anonId,
  selectedOptionIds: z.array(z.string()).default([]),
  textValue: z.string().optional(),
  ratingValue: z.number().optional(),
  quizQuestionId: z.string().optional(),
  isCorrect: z.boolean().optional(),
  awardedPoints: z.number().optional(),
  createdAt: isoDate,
});
export type Response = z.infer<typeof responseSchema>;

/** Payload for activity:respond (poll/feedback). */
export const activityRespondSchema = z.object({
  activityId: objectId,
  selectedOptionIds: z.array(z.string()).optional(),
  textValue: z.string().max(2000).optional(),
  ratingValue: z.number().optional(),
});
export type ActivityRespond = z.infer<typeof activityRespondSchema>;
