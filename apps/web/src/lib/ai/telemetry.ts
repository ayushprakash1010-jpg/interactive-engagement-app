export interface AITrace {
  requestId: string;
  provider: string;
  model: string;
  feature: string;
  promptVersion: string;
  latency: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  cacheHit: boolean;
  retryCount: number;
  status: 'success' | 'error';
  timestamp: string;
  error?: string;
}

export interface ProviderHealth {
  provider: string;
  model: string;
  status: 'healthy' | 'degraded' | 'down';
  availability: number; // 0-100%
  lastError?: string;
  averageLatency: number;
  retryRate: number; // 0-100%
}

class TelemetryTracker {
  private traces: AITrace[] = [];
  
  // Cost estimation constants (Mock values for Gemini 1.5 Pro)
  private readonly COST_PER_1M_INPUT_TOKENS = 3.50;
  private readonly COST_PER_1M_OUTPUT_TOKENS = 10.50;

  recordTrace(trace: Omit<AITrace, 'estimatedCost'>) {
    const estimatedCost = this.calculateCost(trace.inputTokens, trace.outputTokens);
    const fullTrace = { ...trace, estimatedCost };
    this.traces.push(fullTrace);
    console.log(`[Telemetry] Recorded trace for ${trace.feature} via ${trace.provider} (${trace.latency}ms, $${estimatedCost.toFixed(5)})`);
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    return ((inputTokens / 1_000_000) * this.COST_PER_1M_INPUT_TOKENS) + 
           ((outputTokens / 1_000_000) * this.COST_PER_1M_OUTPUT_TOKENS);
  }

  getTraces(): AITrace[] {
    return this.traces;
  }

  getProviderHealth(provider: string, model: string): ProviderHealth {
    const relevantTraces = this.traces.filter(t => t.provider === provider && t.model === model);
    if (relevantTraces.length === 0) {
      return { provider, model, status: 'healthy', availability: 100, averageLatency: 0, retryRate: 0 };
    }

    const successful = relevantTraces.filter(t => t.status === 'success');
    const totalLatency = successful.reduce((sum, t) => sum + t.latency, 0);
    const averageLatency = successful.length > 0 ? totalLatency / successful.length : 0;
    
    const availability = (successful.length / relevantTraces.length) * 100;
    const retryRate = (relevantTraces.filter(t => t.retryCount > 0).length / relevantTraces.length) * 100;
    
    const errors = relevantTraces.filter(t => t.status === 'error');
    const lastError = errors.length > 0 ? errors[errors.length - 1]?.error : undefined;

    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (availability < 95) status = 'degraded';
    if (availability < 80) status = 'down';

    return { provider, model, status, availability, averageLatency, retryRate, lastError };
  }
}

export const Telemetry = new TelemetryTracker();
