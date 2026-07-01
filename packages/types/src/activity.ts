import { z } from 'zod';
import { objectId, timestamps } from './common.js';

export const activityType = z.enum(['poll', 'quiz', 'wordcloud', 'feedback', 'survey']);
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
  timeLimitSec: z.number().int().min(5).max(600).optional(), 
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
  /** Award extra points for fast correct answers (scaled by remaining time). */
  speedBonusEnabled: z.boolean().default(false),
});
export type QuizConfig = z.infer<typeof quizConfigSchema>;

export const wordcloudConfigSchema = z.object({
  prompt: z.string().min(1),
  maxWordsPerParticipant: z.number().int().min(1).max(20).default(3),
  timeLimitSec: z.number().int().min(5).max(600).optional(),
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
  timeLimitSec: z.number().int().min(5).max(600).optional(), // <--- Added Timer Support
});
export type FeedbackConfig = z.infer<typeof feedbackConfigSchema>;

// ---- Survey ----

export const surveyQuestionType = z.enum(['single', 'multiple', 'rating', 'open']);
export type SurveyQuestionType = z.infer<typeof surveyQuestionType>;

export const surveyQuestionSchema = z.object({
  id: z.string().min(1),
  type: surveyQuestionType,
  label: z.string().min(1),
  options: z.array(pollOptionSchema).optional(),
  isRequired: z.boolean().default(false),
  pageIndex: z.number().int().min(0).default(0), // For pagination/sections
});
export type SurveyQuestion = z.infer<typeof surveyQuestionSchema>;

export const surveyConfigSchema = z.object({
  displayMode: z.enum(['stepper', 'scroll']).default('stepper'),
  questions: z.array(surveyQuestionSchema).default([]),
  timeLimitSec: z.number().int().min(5).max(600).optional(),
});
export type SurveyConfig = z.infer<typeof surveyConfigSchema>;

/** Discriminated union keyed by `type` so config is validated per activity type. */
export const activityConfigSchema = z.union([
  pollConfigSchema,
  quizConfigSchema,
  wordcloudConfigSchema,
  feedbackConfigSchema,
  surveyConfigSchema,
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