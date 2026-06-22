'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './events-api';

export type HeadlineStats = {
  totalParticipants: number;
  totalResponses: number;
  uniqueResponders?: number;
  participationRate: number;
};

export type PollAnalytics = {
  activityId: string;
  title: string;
  pollType: 'single' | 'multiple' | 'rating' | 'open';
  totalResponses: number;
  options?: Array<{
    id: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  average?: number;
  distribution?: Array<{
    rating: number;
    count: number;
  }>;
  responses?: string[];
};

export type QuizAnalytics = {
  activityId: string;
  title: string;
  leaderboard: Array<{
    anonId?: string;
    name?: string;
    totalPoints: number;
    points?: number;
  }>;
  questionStats: Array<{
    questionId: string;
    total: number;
    correct: number;
    correctPct: number;
  }>;
};

export type QaAnalytics = {
  totalQuestions: number;
  approvedQuestions: number;
  answeredQuestions: number;
  topQuestions: Array<{
    _id: string;
    text: string;
    voteCount: number;
    status: string;
    authorName?: string | null;
  }>;
};

export type WordCloudAnalytics = {
  activityId: string;
  title: string;
  prompt?: string;
  words: Array<{
    text: string;
    weight: number;
  }>;
};

export type FeedbackFieldAnalytics = {
  fieldId: string;
  label: string;
  type: 'rating' | 'text';
  average?: number;
  distribution?: Record<string, number> | Record<number, number>;
  responses?: string[];
  count: number;
};

export type FeedbackAnalytics = {
  activityId: string;
  title: string;
  fields: FeedbackFieldAnalytics[];
  totalResponses: number;
};

export type EngagementPoint = {
  minute: string;
  responses: number;
};

export type EventAnalytics = {
  eventId: string;
  generatedAt: string;
  headlineStats: HeadlineStats;
  activities?: Array<{
    _id: string;
    type: string;
    title: string;
    status: string;
  }>;
  pollAnalytics: PollAnalytics[];
  quizAnalytics: QuizAnalytics[];
  qaAnalytics: QaAnalytics;
  wordCloudAnalytics: WordCloudAnalytics[];
  feedbackAnalytics: FeedbackAnalytics[];
  engagementTimeline: EngagementPoint[];
};

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: () => apiFetch<EventAnalytics>(`events/${eventId}/analytics`),
    enabled: Boolean(eventId),
  });
}