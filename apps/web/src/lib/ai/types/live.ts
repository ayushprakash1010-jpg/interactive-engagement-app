export type LiveEngagementMetrics = {
  participationRate: number;
  averageResponseTimeSec: number;
  audienceActivityLevel: 'High' | 'Medium' | 'Low';
  momentum: 'Increasing' | 'Stable' | 'Decreasing';
  silenceDetected: boolean;
  engagementTrend: 'Up' | 'Down' | 'Flat';
};

export type AudienceMood = {
  primary: 'Positive' | 'Neutral' | 'Negative' | 'Excited' | 'Confused' | 'Frustrated' | 'Curious';
  trend: 'Improving' | 'Declining' | 'Stable';
};

export type SmartAlert = {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  isDismissed?: boolean;
};

export type LiveRecommendation = {
  id: string;
  title: string;
  description: string;
  actionPayload?: any; 
};

export type QuestionCluster = {
  id: string;
  topic: string;
  questionIds: string[];
  sentiment: string;
  isPriority: boolean;
};

export type LiveAssistantState = {
  eventId: string;
  metrics: LiveEngagementMetrics;
  mood: AudienceMood;
  alerts: SmartAlert[];
  recommendations: LiveRecommendation[];
  questionClusters: QuestionCluster[];
  liveSummary: string;
  currentActivityId?: string;
  timeRemainingSec?: number;
};
