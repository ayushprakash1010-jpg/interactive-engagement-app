export const AI_CONFIG = {
  defaultModel: 'gemini-2.5-flash',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 8192,
  timeoutMs: 30000,
  retryCount: 2,
  cacheTtlMs: 1000 * 60 * 60, // 1 hour
};

export type FeatureOverrides = Partial<typeof AI_CONFIG>;
