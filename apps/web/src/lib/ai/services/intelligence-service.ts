import { type AIProvider } from '../providers';
import { type PostEventIntelligence } from '../types';

export class IntelligenceService {
  constructor(private provider: AIProvider) {}

  /**
   * Generates comprehensive AI Post Event Intelligence
   */
  async generateIntelligence(eventId: string, contextData?: any): Promise<PostEventIntelligence> {
    try {
      const intel = await this.provider.generatePostEventIntelligence(eventId, contextData);
      return intel;
    } catch (error) {
      console.error('[IntelligenceService] Error generating post-event intelligence:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate post-event intelligence. Please try again.'
      );
    }
  }
}
