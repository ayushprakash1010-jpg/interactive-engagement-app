import { Type, Schema } from '@google/genai';
import { type AIProvider } from './interface';
import { type SessionPlan, type DraftActivity, type SessionReview, type PostEventIntelligence, type LiveAssistantState } from '../types';
import { BaseProvider } from './base-provider';
import { 
  SessionGenerationResultSchema, 
  ProposedChangeSchema, 
  SessionReviewSchema, 
  PostEventIntelligenceSchema, 
  LiveAssistantStateSchema 
} from '../schemas';

// Convert our Zod schema into the Google GenAI Type schema required by the SDK
const sessionPlanResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    plan: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        objective: { type: Type.STRING },
        audience: { type: Type.STRING },
        eventType: { type: Type.STRING },
        duration: { type: Type.STRING },
        tone: { type: Type.STRING },
        estimatedEngagement: { type: Type.NUMBER },
        planningConfidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        durationFit: { type: Type.NUMBER },
        interactionVariety: { type: Type.STRING },
        agenda: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              timeOffsetMinutes: { type: Type.NUMBER },
              activityId: { type: Type.STRING },
              title: { type: Type.STRING },
              durationMinutes: { type: Type.NUMBER },
              purpose: { type: Type.STRING, enum: ['intro', 'engagement', 'assessment', 'closing', 'content'] },
            },
            required: ['id', 'timeOffsetMinutes', 'title', 'durationMinutes', 'purpose']
          }
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              action: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            },
            required: ['id', 'title', 'description', 'priority']
          }
        },
      },
      required: ['id', 'title', 'objective', 'audience', 'eventType', 'duration', 'tone', 'estimatedEngagement', 'planningConfidence', 'durationFit', 'interactionVariety', 'agenda', 'recommendations']
    },
    drafts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['poll', 'quiz', 'wordcloud', 'feedback', 'survey'] },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          config: { type: Type.OBJECT }
        },
        required: ['id', 'type', 'title', 'description']
      }
    }
  },
  required: ['plan', 'drafts']
};

const proposedChangeResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    originalPlan: sessionPlanResponseSchema.properties?.plan as Schema,
    proposedPlan: sessionPlanResponseSchema.properties?.plan as Schema,
    diffSummary: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    reasoning: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    affectedActivities: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    estimatedImpact: { type: Type.STRING },
    status: { type: Type.STRING, enum: ['pending', 'accepted', 'rejected'] }
  },
  required: ['id', 'originalPlan', 'proposedPlan', 'diffSummary', 'status']
};

const sessionReviewResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    categoryScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          score: { type: Type.NUMBER }
        },
        required: ['label', 'score']
      }
    },
    health: {
      type: Type.OBJECT,
      properties: {
        engagementPrediction: { type: Type.NUMBER },
        audienceFatigue: { type: Type.STRING },
        varietyIndex: { type: Type.NUMBER }
      },
      required: ['engagementPrediction', 'audienceFatigue', 'varietyIndex']
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['info', 'low', 'medium', 'high', 'critical'] },
          reason: { type: Type.STRING },
          evidence: { type: Type.STRING },
          suggestedFix: { type: Type.STRING },
          proposedChange: proposedChangeResponseSchema
        },
        required: ['id', 'category', 'severity', 'reason', 'evidence', 'suggestedFix']
      }
    },
    activityReviews: {
      type: Type.OBJECT,
      description: "A dictionary where the key is the activityId and the value is the activity review object. Each object must contain: activityId (string), quality (number), readingTimeSec (number), bias ('None'|'Low'|'High'), difficulty ('Easy'|'Medium'|'Hard'), and recommendations (array of findings)."
    }
  },
  required: ['overallScore', 'categoryScores', 'health', 'findings', 'activityReviews']
};

const postEventIntelligenceResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    eventId: { type: Type.STRING },
    executiveSummary: {
      type: Type.OBJECT,
      properties: {
        meetingGoal: { type: Type.STRING },
        overallSuccess: { type: Type.STRING },
        participationOverview: { type: Type.STRING },
        majorOutcomes: { type: Type.STRING },
        criticalObservations: { type: Type.STRING },
        keyRecommendations: { type: Type.STRING }
      },
      required: ['meetingGoal', 'overallSuccess', 'participationOverview', 'majorOutcomes', 'criticalObservations', 'keyRecommendations']
    },
    keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          owner: { type: Type.STRING },
          reason: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ['Pending', 'In Progress', 'Completed'] }
        },
        required: ['id', 'title', 'description', 'priority', 'owner', 'reason', 'confidence', 'status']
      }
    },
    topicAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          mentions: { type: Type.NUMBER },
          sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
          importance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          trend: { type: Type.STRING, enum: ['Up', 'Down', 'Flat'] },
          quotes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['name', 'mentions', 'sentiment', 'importance', 'trend', 'quotes']
      }
    },
    sentimentIntelligence: {
      type: Type.OBJECT,
      properties: {
        overall: { type: Type.STRING },
        distribution: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              emotion: { type: Type.STRING },
              percentage: { type: Type.NUMBER }
            },
            required: ['emotion', 'percentage']
          }
        }
      },
      required: ['overall', 'distribution']
    },
    engagementJourney: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] }
        },
        required: ['time', 'description', 'impact']
      }
    },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    followUpSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    crossActivityAnalysis: {
      type: Type.OBJECT,
      properties: {
        mostEngaging: { type: Type.STRING },
        lowestCompletion: { type: Type.STRING },
        mostDiscussedTopic: { type: Type.STRING },
        highestRatedSpeaker: { type: Type.STRING }
      },
      required: ['mostEngaging', 'lowestCompletion', 'mostDiscussedTopic']
    }
  },
  required: [
    'id', 'eventId', 'executiveSummary', 'keyTakeaways', 'actionItems',
    'topicAnalysis', 'sentimentIntelligence', 'engagementJourney',
    'recommendations', 'followUpSuggestions', 'crossActivityAnalysis'
  ]
};

const liveAssistantStateResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    eventId: { type: Type.STRING },
    metrics: {
      type: Type.OBJECT,
      properties: {
        participationRate: { type: Type.NUMBER },
        averageResponseTimeSec: { type: Type.NUMBER },
        audienceActivityLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        momentum: { type: Type.STRING, enum: ['Increasing', 'Stable', 'Decreasing'] },
        silenceDetected: { type: Type.BOOLEAN },
        engagementTrend: { type: Type.STRING, enum: ['Up', 'Down', 'Flat'] }
      },
      required: ['participationRate', 'averageResponseTimeSec', 'audienceActivityLevel', 'momentum', 'silenceDetected', 'engagementTrend']
    },
    mood: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Excited', 'Confused', 'Frustrated', 'Curious'] },
        trend: { type: Type.STRING, enum: ['Improving', 'Declining', 'Stable'] }
      },
      required: ['primary', 'trend']
    },
    alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['info', 'warning', 'critical'] },
          message: { type: Type.STRING },
          isDismissed: { type: Type.BOOLEAN }
        },
        required: ['id', 'type', 'message']
      }
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['id', 'title', 'description']
      }
    },
    questionClusters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          topic: { type: Type.STRING },
          questionIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          sentiment: { type: Type.STRING },
          isPriority: { type: Type.BOOLEAN }
        },
        required: ['id', 'topic', 'questionIds', 'sentiment', 'isPriority']
      }
    },
    liveSummary: { type: Type.STRING },
    currentActivityId: { type: Type.STRING },
    timeRemainingSec: { type: Type.NUMBER }
  },
  required: ['eventId', 'metrics', 'mood', 'alerts', 'recommendations', 'questionClusters', 'liveSummary']
};

import { PLANNER_PROMPT, REVIEWER_PROMPT, COPILOT_PROMPT, INTELLIGENCE_PROMPT, LIVE_PROMPT } from '../prompts';

export class GeminiProvider extends BaseProvider implements AIProvider {
  constructor(apiKey: string) {
    super(apiKey, 'Gemini 1.5 Pro', 'gemini-2.5-flash');
  }

  async generateSessionPlan(config: Record<string, any>): Promise<{ plan: SessionPlan; drafts: DraftActivity[] }> {
    return this.executeGeminiRequest(
      PLANNER_PROMPT,
      config,
      sessionPlanResponseSchema,
      SessionGenerationResultSchema,
      'generateSessionPlan',
      true
    );
  }

  async processMutation(intent: string, currentPlan: SessionPlan, drafts: DraftActivity[], accepted: DraftActivity[]): Promise<{ newPlan: SessionPlan; diffSummary: string[]; reasoning?: string; confidence?: number; affectedActivities?: string[]; estimatedImpact?: string; }> {
    const result = await this.executeGeminiRequest(
      COPILOT_PROMPT,
      { intent, plan: currentPlan, drafts },
      proposedChangeResponseSchema,
      ProposedChangeSchema,
      'processMutation',
      false // Do not cache live mutations
    );

    return {
      newPlan: result.proposedPlan,
      diffSummary: result.diffSummary,
      reasoning: result.reasoning,
      confidence: result.confidence,
      affectedActivities: result.affectedActivities,
      estimatedImpact: result.estimatedImpact
    };
  }

  async evaluateSession(plan: SessionPlan, drafts: DraftActivity[], accepted: DraftActivity[]): Promise<SessionReview> {
    return this.executeGeminiRequest(
      REVIEWER_PROMPT,
      { plan, drafts },
      sessionReviewResponseSchema,
      SessionReviewSchema,
      'evaluateSession',
      true
    );
  }

  async generatePostEventIntelligence(eventId: string, contextData?: any): Promise<PostEventIntelligence> {
    return this.executeGeminiRequest(
      INTELLIGENCE_PROMPT,
      contextData || { eventId },
      postEventIntelligenceResponseSchema,
      PostEventIntelligenceSchema,
      'generatePostEventIntelligence',
      true
    );
  }

  async analyzeLiveEvent(eventId: string, currentContext?: any): Promise<LiveAssistantState> {
    return this.executeGeminiRequest(
      LIVE_PROMPT,
      currentContext || { eventId },
      liveAssistantStateResponseSchema,
      LiveAssistantStateSchema,
      'analyzeLiveEvent',
      false // Do not cache live analysis
    );
  }
}
