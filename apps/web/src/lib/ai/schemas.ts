import { z } from 'zod';

export const TimelineItemSchema = z.object({
  id: z.string(),
  timeOffsetMinutes: z.number(),
  activityId: z.string().optional(),
  title: z.string(),
  durationMinutes: z.number(),
  purpose: z.enum(['intro', 'engagement', 'assessment', 'closing', 'content']),
});

export const PlanningRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  action: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
});

export const SessionPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  audience: z.string(),
  eventType: z.string(),
  duration: z.string(),
  tone: z.string(),

  estimatedEngagement: z.number(),
  planningConfidence: z.enum(['High', 'Medium', 'Low']),
  durationFit: z.number(),
  interactionVariety: z.string(),

  agenda: z.array(TimelineItemSchema),
  recommendations: z.array(PlanningRecommendationSchema),
});

export const DraftActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['poll', 'quiz', 'wordcloud', 'feedback', 'survey']),
  title: z.string(),
  description: z.string(),
  config: z.record(z.unknown()).optional(),
});

export const SessionGenerationResultSchema = z.object({
  plan: SessionPlanSchema,
  drafts: z.array(DraftActivitySchema),
});

export const ProposedChangeSchema = z.object({
  id: z.string(),
  originalPlan: SessionPlanSchema,
  proposedPlan: SessionPlanSchema,
  diffSummary: z.array(z.string()),
  reasoning: z.string().optional(),
  confidence: z.number().optional(),
  affectedActivities: z.array(z.string()).optional(),
  estimatedImpact: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

export const ReviewFindingSchema = z.object({
  id: z.string(),
  category: z.string(),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']),
  reason: z.string(),
  evidence: z.string(),
  suggestedFix: z.string(),
  proposedChange: ProposedChangeSchema.optional(),
});

export const ActivityReviewSchema = z.object({
  activityId: z.string(),
  quality: z.number(),
  readingTimeSec: z.number(),
  bias: z.enum(['None', 'Low', 'High']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  recommendations: z.array(ReviewFindingSchema),
});

export const SessionReviewSchema = z.object({
  overallScore: z.number(),
  categoryScores: z.array(z.object({
    label: z.string(),
    score: z.number()
  })),
  health: z.object({
    engagementPrediction: z.number(),
    audienceFatigue: z.string(),
    varietyIndex: z.number(),
  }),
  findings: z.array(ReviewFindingSchema),
  activityReviews: z.record(z.string(), ActivityReviewSchema),
});

export const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  owner: z.string(),
  reason: z.string(),
  confidence: z.number(),
  status: z.enum(['Pending', 'In Progress', 'Completed']),
});

export const TopicClusterSchema = z.object({
  name: z.string(),
  mentions: z.number(),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']),
  importance: z.enum(['High', 'Medium', 'Low']),
  trend: z.enum(['Up', 'Down', 'Flat']),
  quotes: z.array(z.string()),
});

export const EngagementEventSchema = z.object({
  time: z.string(),
  description: z.string(),
  impact: z.enum(['Positive', 'Negative', 'Neutral']),
});

export const SentimentDetailSchema = z.object({
  emotion: z.string(),
  percentage: z.number(),
});

export const PostEventIntelligenceSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  executiveSummary: z.object({
    meetingGoal: z.string(),
    overallSuccess: z.string(),
    participationOverview: z.string(),
    majorOutcomes: z.string(),
    criticalObservations: z.string(),
    keyRecommendations: z.string(),
  }),
  keyTakeaways: z.array(z.string()),
  actionItems: z.array(ActionItemSchema),
  topicAnalysis: z.array(TopicClusterSchema),
  sentimentIntelligence: z.object({
    overall: z.string(),
    distribution: z.array(SentimentDetailSchema),
  }),
  engagementJourney: z.array(EngagementEventSchema),
  recommendations: z.array(z.string()),
  followUpSuggestions: z.array(z.string()),
  crossActivityAnalysis: z.object({
    mostEngaging: z.string(),
    lowestCompletion: z.string(),
    mostDiscussedTopic: z.string(),
    highestRatedSpeaker: z.string().optional(),
  }),
});

export const LiveEngagementMetricsSchema = z.object({
  participationRate: z.number(),
  averageResponseTimeSec: z.number(),
  audienceActivityLevel: z.enum(['High', 'Medium', 'Low']),
  momentum: z.enum(['Increasing', 'Stable', 'Decreasing']),
  silenceDetected: z.boolean(),
  engagementTrend: z.enum(['Up', 'Down', 'Flat']),
});

export const AudienceMoodSchema = z.object({
  primary: z.enum(['Positive', 'Neutral', 'Negative', 'Excited', 'Confused', 'Frustrated', 'Curious']),
  trend: z.enum(['Improving', 'Declining', 'Stable']),
});

export const SmartAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  isDismissed: z.boolean().optional(),
});

export const LiveRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  actionPayload: z.any().optional(),
});

export const QuestionClusterSchema = z.object({
  id: z.string(),
  topic: z.string(),
  questionIds: z.array(z.string()),
  sentiment: z.string(),
  isPriority: z.boolean(),
});

export const LiveAssistantStateSchema = z.object({
  eventId: z.string(),
  metrics: LiveEngagementMetricsSchema,
  mood: AudienceMoodSchema,
  alerts: z.array(SmartAlertSchema),
  recommendations: z.array(LiveRecommendationSchema),
  questionClusters: z.array(QuestionClusterSchema),
  liveSummary: z.string(),
  currentActivityId: z.string().optional(),
  timeRemainingSec: z.number().optional(),
});
