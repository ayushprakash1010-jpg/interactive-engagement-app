import { type AIProvider } from '../providers/interface';
import { type SessionPlan, type DraftActivity, type SessionReview } from '../types';

export class ReviewService {
  constructor(private provider: AIProvider) {}

  async evaluatePlan(plan: SessionPlan, drafts: DraftActivity[]): Promise<SessionReview> {
    console.log(`[ReviewService] Evaluating plan: ${plan.id} via ${this.provider.name}`);
    try {
      const result = await this.provider.evaluateSession(plan, drafts, []);
      console.log(`[ReviewService] Successfully evaluated plan: ${plan.id}. Score: ${result.overallScore}`);
      return result;
    } catch (error) {
      console.error('[ReviewService] Error evaluating plan:', error);
      throw error;
    }
  }
}
