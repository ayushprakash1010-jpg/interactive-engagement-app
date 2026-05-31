import { z } from 'zod';
import { anonId, objectId, timestamps } from './common.js';

export const questionStatus = z.enum(['pending', 'approved', 'answered', 'dismissed']);
export type QuestionStatus = z.infer<typeof questionStatus>;

/** Anonymous Q&A. */
export const questionSchema = z.object({
  _id: objectId,
  eventId: objectId,
  text: z.string().min(1).max(1000),
  authorAnonId: anonId,
  authorName: z.string().max(80).optional(),
  voteCount: z.number().int().min(0).default(0),
  voterAnonIds: z.array(anonId).default([]),
  status: questionStatus,
  ...timestamps,
});
export type Question = z.infer<typeof questionSchema>;

/** Payload for qa:ask. */
export const askQuestionSchema = z.object({
  text: z.string().min(1).max(1000),
  displayName: z.string().max(80).optional(),
});
export type AskQuestion = z.infer<typeof askQuestionSchema>;
