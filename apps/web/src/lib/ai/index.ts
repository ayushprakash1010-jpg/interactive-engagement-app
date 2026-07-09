import { MockProvider, GeminiProvider } from './providers';
import { PlanningService, CopilotService, ReviewService, LibraryService, IntelligenceService, LiveAssistantService } from './services';

// Initialize the default AI platform instance
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const provider = apiKey ? new GeminiProvider(apiKey) : new MockProvider();

export const ai = {
  planner: new PlanningService(provider),
  copilot: new CopilotService(provider),
  reviewer: new ReviewService(provider),
  library: new LibraryService(),
  intelligence: new IntelligenceService(provider),
  live: new LiveAssistantService(provider),
};

export * from './types';
export * from './errors';
export * from './schemas';
export * from './providers';
export * from './services';
export * from './config';
export * from './telemetry';
export * from './cache';
export * from './security';
export * from './evaluation';
