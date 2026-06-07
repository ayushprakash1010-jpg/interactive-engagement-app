import { z } from 'zod';
import { anonId, isoDate, objectId } from './common.js';

export const feedbackAnswerSchema = z
  .object({
    fieldId: z.string().min(1),
    type: z.enum(['rating', 'text']),
    ratingValue: z.number().optional(),
    textValue: z.string().max(2000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'rating') {
      if (value.ratingValue === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ratingValue is required for rating feedback fields',
          path: ['ratingValue'],
        });
      }
      if (value.textValue !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'textValue is not allowed for rating feedback fields',
          path: ['textValue'],
        });
      }
    }

    if (value.type === 'text') {
      if (!value.textValue?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'textValue is required for text feedback fields',
          path: ['textValue'],
        });
      }
      if (value.ratingValue !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ratingValue is not allowed for text feedback fields',
          path: ['ratingValue'],
        });
      }
    }
  });

export type FeedbackAnswer = z.infer<typeof feedbackAnswerSchema>;

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
  words: z.array(z.string().min(1)).default([]),
  feedbackAnswers: z.array(feedbackAnswerSchema).default([]),
  createdAt: isoDate,
});
export type Response = z.infer<typeof responseSchema>;

/** Payload for activity:respond (poll/feedback). */
export const activityRespondSchema = z
  .object({
    activityId: objectId,
    selectedOptionIds: z.array(z.string()).optional(),
    textValue: z.string().max(2000).optional(),
    ratingValue: z.number().optional(),
    feedbackAnswers: z.array(feedbackAnswerSchema).optional(),
  })
  .refine(
    (value) =>
      value.selectedOptionIds !== undefined ||
      value.textValue !== undefined ||
      value.ratingValue !== undefined ||
      value.feedbackAnswers !== undefined,
    {
      message: 'At least one response field is required',
    },
  );

export type ActivityRespond = z.infer<typeof activityRespondSchema>;