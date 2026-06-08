import { useQuery } from '@tanstack/react-query';
import { apiFetch, apiFetchBlob } from '@/lib/events-api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeadlineStats = {
  totalParticipants: number;
  totalResponses: number;
  uniqueResponders: number;
  participationRate: number; // percent, e.g. 80 = 80%
};

export type PollOptionTally = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

export type RatingDistributionEntry = {
  rating: number;
  count: number;
};

export type PollAnalytic = {
  activityId: string;
  title: string;
  pollType: 'single' | 'multiple' | 'rating' | 'open';
  options?: PollOptionTally[];
  totalResponses: number;
  average?: number;
  distribution?: RatingDistributionEntry[] | Record<string, number>;
  responses?: string[];
};

export type QuizLeaderboardEntry = {
  participantAnonId: string;
  totalPoints: number;
};

export type QuizQuestionStat = {
  questionId: string;
  text: string;
  total: number;
  correct: number;
  correctPct: number; // backend may send ratio or percent depending on transform layer
};

export type QuizAnalytic = {
  activityId: string;
  title: string;
  leaderboard: QuizLeaderboardEntry[];
  questionStats: QuizQuestionStat[];
};

export type QaTopQuestion = {
  _id?: string;
  id?: string;
  text: string;
  voteCount: number;
  status: string;
  authorName: string | null;
};

export type QaAnalytic = {
  totalQuestions: number;
  approvedQuestions: number;
  answeredQuestions: number;
  topQuestions: QaTopQuestion[];
};

export type WordEntry = {
  text: string;
  weight: number;
};

export type WordCloudAnalytic = {
  activityId: string;
  title: string;
  prompt: string;
  words: WordEntry[];
};

export type FeedbackFieldStat =
  | {
      fieldId: string;
      label: string;
      type: 'rating';
      average: number;
      distribution: Record<string, number>;
      count: number;
    }
  | {
      fieldId: string;
      label: string;
      type: 'text';
      responses: string[];
      count: number;
    };

export type FeedbackAnalytic = {
  activityId: string;
  title: string;
  fields: FeedbackFieldStat[];
  totalResponses: number;
};

export type TimelineBucket = {
  minute: string;
  responses: number;
};

export type AnalyticsReport = {
  eventId: string;
  generatedAt: string;
  headlineStats: HeadlineStats;
  pollAnalytics: PollAnalytic[];
  quizAnalytics: QuizAnalytic[];
  qaAnalytics: QaAnalytic;
  wordCloudAnalytics: WordCloudAnalytic[];
  feedbackAnalytics: FeedbackAnalytic[];
  engagementTimeline: TimelineBucket[];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics(eventId: string) {
  return useQuery<AnalyticsReport>({
    queryKey: ['analytics', eventId],
    queryFn: () => apiFetch<AnalyticsReport>(`events/${eventId}/analytics`),
    enabled: !!eventId,
    staleTime: 60_000,
    retry: 1,
  });
}

// ─── Download helpers ─────────────────────────────────────────────────────────

export async function downloadReport(eventId: string, format: 'csv' | 'pdf') {
  const blob = await apiFetchBlob(`events/${eventId}/report.${format}`);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `event-report-${eventId}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}