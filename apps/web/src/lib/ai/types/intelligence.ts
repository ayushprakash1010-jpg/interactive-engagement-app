export type ActionItem = {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  owner: string;
  reason: string;
  confidence: number;
  status: 'Pending' | 'In Progress' | 'Completed';
};

export type TopicCluster = {
  name: string;
  mentions: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  importance: 'High' | 'Medium' | 'Low';
  trend: 'Up' | 'Down' | 'Flat';
  quotes: string[];
};

export type EngagementEvent = {
  time: string;
  description: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
};

export type SentimentDetail = {
  emotion: string; // e.g., 'Excitement', 'Confusion'
  percentage: number;
};

export type PostEventIntelligence = {
  id: string;
  eventId: string;
  executiveSummary: {
    meetingGoal: string;
    overallSuccess: string;
    participationOverview: string;
    majorOutcomes: string;
    criticalObservations: string;
    keyRecommendations: string;
  };
  keyTakeaways: string[];
  actionItems: ActionItem[];
  topicAnalysis: TopicCluster[];
  sentimentIntelligence: {
    overall: string;
    distribution: SentimentDetail[];
  };
  engagementJourney: EngagementEvent[];
  recommendations: string[];
  followUpSuggestions: string[];
  crossActivityAnalysis: {
    mostEngaging: string;
    lowestCompletion: string;
    mostDiscussedTopic: string;
    highestRatedSpeaker?: string;
  };
};
