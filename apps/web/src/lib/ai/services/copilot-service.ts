import { type AIProvider } from '../providers/interface';
import { type SessionPlan, type DraftActivity } from '../types';

export class CopilotService {
  constructor(private provider: AIProvider) {}

  async mutatePlan(intent: string, currentPlan: SessionPlan, drafts: DraftActivity[], accepted: DraftActivity[]): Promise<{ newPlan: SessionPlan; diffSummary: string[]; reasoning?: string; confidence?: number; affectedActivities?: string[]; estimatedImpact?: string; }> {
    console.log(`[CopilotService] Processing mutation intent: "${intent}" via ${this.provider.name}`);
    try {
      const result = await this.provider.processMutation(intent, currentPlan, drafts, accepted);
      console.log(`[CopilotService] Successfully proposed mutations for plan: ${currentPlan.id}`);
      return result;
    } catch (error) {
      console.error('[CopilotService] Error processing mutation:', error);
      throw error;
    }
  }
}
