import { type DraftActivity, type SessionPlan, type SessionReview, type PostEventIntelligence, type LiveAssistantState } from '../types';

export interface AIProvider {
  /**
   * Identifies the provider for logging/auditing.
   */
  readonly name: string;

  /**
   * Generate an initial session plan and drafts based on configuration
   */
  generateSessionPlan(config: Record<string, any>): Promise<{
    plan: SessionPlan;
    drafts: DraftActivity[];
  }>;

  /**
   * Process a copilot intent to mutate an existing plan
   */
  processMutation(intent: string, currentPlan: SessionPlan, drafts: DraftActivity[], accepted: DraftActivity[]): Promise<{
    newPlan: SessionPlan;
    diffSummary: string[];
    reasoning?: string;
    confidence?: number;
    affectedActivities?: string[];
    estimatedImpact?: string;
  }>;

  /**
   * Evaluate a session plan and its drafts for quality
   */
  evaluateSession(plan: SessionPlan, drafts: DraftActivity[], accepted: DraftActivity[]): Promise<SessionReview>;

  /**
   * Generates Post-Event Intelligence based on event analytics data
   */
  generatePostEventIntelligence(eventId: string, contextData?: any): Promise<PostEventIntelligence>;

  /**
   * Analyzes a live event and provides real-time assistant state
   */
  analyzeLiveEvent(eventId: string, currentContext?: any): Promise<LiveAssistantState>;
}
