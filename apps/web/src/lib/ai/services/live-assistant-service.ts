import { type AIProvider } from '../providers/interface';
import { type LiveAssistantState } from '../types';

export class LiveAssistantService {
  constructor(private provider: AIProvider) {}

  /**
   * Retrieves the real-time AI analysis for an active event.
   * This is designed to be polled periodically by the client or called on-demand.
   * In a future architecture, this could be backed by a websocket stream.
   * 
   * @param eventId The ID of the live event.
   * @param currentContext Optional context such as current slide, active poll, or UI state.
   */
  async getLiveState(eventId: string, currentContext?: any): Promise<LiveAssistantState> {
    console.log(`[LiveAssistantService] Analyzing live state for event: ${eventId}`);
    try {
      const state = await this.provider.analyzeLiveEvent(eventId, currentContext);
      console.log(`[LiveAssistantService] Analysis complete. Mood: ${state.mood.primary}, Alerts: ${state.alerts.length}`);
      return state;
    } catch (error) {
      console.error('[LiveAssistantService] Error analyzing live state:', error);
      throw error;
    }
  }
}
