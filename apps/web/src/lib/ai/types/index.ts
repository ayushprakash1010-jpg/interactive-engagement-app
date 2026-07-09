import { type ActivityType } from '@/components/pulse';

// ----------------------------------------------------------------------
// Planner Types
// ----------------------------------------------------------------------
export type TimelineItem = {
  id: string;
  timeOffsetMinutes: number;
  activityId?: string; // If this corresponds to a generated activity
  title: string;
  durationMinutes: number;
  purpose: 'intro' | 'engagement' | 'assessment' | 'closing' | 'content';
};

export type PlanningRecommendation = {
  id: string;
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
};

export type SessionPlan = {
  id: string;
  title: string;
  objective: string;
  audience: string;
  eventType: string;
  duration: string;
  tone: string;

  estimatedEngagement: number;
  planningConfidence: 'High' | 'Medium' | 'Low';
  durationFit: number;
  interactionVariety: string;

  agenda: TimelineItem[];
  recommendations: PlanningRecommendation[];
};

export type DraftActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  config?: Record<string, unknown>;
};

// ----------------------------------------------------------------------
// Copilot / Mutation Types
// ----------------------------------------------------------------------
export type CopilotIntent = {
  action: 'ADJUST_DURATION' | 'ADD_INTERACTION' | 'CHANGE_TONE' | 'CUSTOM_PROMPT';
  payload?: any;
  description: string;
};

export type ProposedChange = {
  id: string;
  originalPlan: SessionPlan;
  proposedPlan: SessionPlan;
  diffSummary: string[];
  reasoning?: string;
  confidence?: number;
  affectedActivities?: string[];
  estimatedImpact?: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposedChangeId?: string;
  timestamp: number;
};

export type CopilotState = {
  messages: ChatMessage[];
  pendingChange: ProposedChange | null;
  history: Array<{ description: string; timestamp: number; type: 'ai' | 'user' | 'accepted' | 'rejected' }>;
  isProcessing: boolean;
};

// ----------------------------------------------------------------------
// Review Engine Types
// ----------------------------------------------------------------------
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type ReviewFinding = {
  id: string;
  category: string;
  severity: Severity;
  reason: string;
  evidence: string;
  suggestedFix: string;
  proposedChange?: ProposedChange;
};

export type ActivityReview = {
  activityId: string;
  quality: number;
  readingTimeSec: number;
  bias: 'None' | 'Low' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendations: ReviewFinding[];
};

export type SessionReview = {
  overallScore: number;
  categoryScores: { label: string; score: number }[];
  health: { 
    engagementPrediction: number; 
    audienceFatigue: string; 
    varietyIndex: number;
  };
  findings: ReviewFinding[];
  activityReviews: Record<string, ActivityReview>;
};

export * from './library';
export * from './intelligence';
export * from './live';