import { z } from 'zod';
import { objectId, timestamps } from './common.js';

export const activityType = z.enum(['poll', 'quiz', 'wordcloud', 'feedback']);
export type ActivityType = z.infer<typeof activityType>;

export const activityStatus = z.enum(['idle', 'live', 'closed']);
export type ActivityStatus = z.infer<typeof activityStatus>;

/** ---- Type-specific config ---- */

export const pollType = z.enum(['single', 'multiple', 'rating', 'open']);
export type PollType = z.infer<typeof pollType>;

export const pollOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const pollConfigSchema = z.object({
  pollType,
  question: z.string().min(1),
  options: z.array(pollOptionSchema).default([]),
  ratingScale: z.number().int().min(2).max(10).optional(),
});
export type PollConfig = z.infer<typeof pollConfigSchema>;

export const quizQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  options: z.array(pollOptionSchema).min(2),
  correctOptionId: z.string().min(1),
  points: z.number().int().min(0).default(1000),
  timeLimitSec: z.number().int().min(5).max(300).default(20),
});

export const quizConfigSchema = z.object({
  questions: z.array(quizQuestionSchema).default([]),
});
export type QuizConfig = z.infer<typeof quizConfigSchema>;

export const wordcloudConfigSchema = z.object({
  prompt: z.string().min(1),
  maxWordsPerParticipant: z.number().int().min(1).max(20).default(3),
});
export type WordcloudConfig = z.infer<typeof wordcloudConfigSchema>;

export const feedbackFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['rating', 'text']),
  label: z.string().min(1),
});

export const feedbackConfigSchema = z.object({
  prompt: z.string().min(1),
  fields: z.array(feedbackFieldSchema).default([]),
});
export type FeedbackConfig = z.infer<typeof feedbackConfigSchema>;

/** Discriminated union keyed by `type` so config is validated per activity type. */
export const activityConfigSchema = z.union([
  pollConfigSchema,
  quizConfigSchema,
  wordcloudConfigSchema,
  feedbackConfigSchema,
]);
export type ActivityConfig = z.infer<typeof activityConfigSchema>;

export const activitySchema = z.object({
  _id: objectId,
  eventId: objectId,
  type: activityType,
  title: z.string().min(1),
  order: z.number().int().min(0).default(0),
  status: activityStatus,
  config: activityConfigSchema,
  ...timestamps,
});
export type Activity = z.infer<typeof activitySchema>;
