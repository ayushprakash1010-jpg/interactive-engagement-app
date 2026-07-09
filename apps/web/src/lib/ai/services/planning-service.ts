import { type AIProvider } from '../providers/interface';
import { type SessionPlan, type DraftActivity } from '../types';

export class PlanningService {
  constructor(private provider: AIProvider) {}

  async generatePlan(config: Record<string, any>): Promise<{ plan: SessionPlan; drafts: DraftActivity[] }> {
    console.log(`[PlanningService] Generating plan using ${this.provider.name}`);
    try {
      const result = await this.provider.generateSessionPlan(config);
      console.log(`[PlanningService] Successfully generated plan: ${result.plan.id}`);
      return result;
    } catch (error) {
      console.error('[PlanningService] Error generating plan:', error);
      throw error;
    }
  }
}
