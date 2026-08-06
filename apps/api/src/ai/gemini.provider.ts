import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import type { Env } from '../config/env.validation';
import Bottleneck from 'bottleneck';

@Injectable()
export class GeminiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  public readonly ai: GoogleGenAI;
  public readonly limiter: Bottleneck;

  constructor(private readonly configService: ConfigService<Env, true>) {
    const apiKey = this.configService.get('GEMINI_API_KEY', { infer: true });
    const rpm = this.configService.get('GEMINI_RATE_LIMIT_RPM', { infer: true });
    const maxRetries = this.configService.get('GEMINI_MAX_RETRIES', { infer: true });
    
    this.ai = new GoogleGenAI({ apiKey });

    // Calculate a smooth pacing minTime to prevent API bursts
    const pacingMinTime = Math.floor(60000 / rpm);

    // Rate Limit Queue
    this.limiter = new Bottleneck({
      reservoir: rpm,
      reservoirRefreshAmount: rpm,
      reservoirRefreshInterval: 60 * 1000,
      
      // Ensure we don't bombard the API instantly even within the limit
      minTime: pacingMinTime, 
      maxConcurrent: 1, // Enterprise apps often use 1 concurrency to pace perfectly
    });

    // Logging listeners
    this.limiter.on('received', (jobInfo) => {
      this.logger.debug(`[AI Queue] Job received. Current queue length: ${this.limiter.queued()}`);
    });
    
    this.limiter.on('executing', (jobInfo) => {
      this.logger.debug(`[AI Queue] Job executing. Retries so far: ${jobInfo.retryCount}. Queue length: ${this.limiter.queued()}`);
    });

    this.limiter.on('dropped', (jobInfo) => {
      this.logger.warn(`[AI Queue] Job dropped from queue!`);
    });

    this.limiter.on('failed', async (error, jobInfo) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const normalized = errorMessage.toLowerCase();
      
      // If we hit a 429 Too Many Requests (or 503), trigger exponential backoff
      if (
        normalized.includes('429') || 
        normalized.includes('503') || 
        normalized.includes('quota') || 
        normalized.includes('resource_exhausted') ||
        normalized.includes('unavailable') ||
        normalized.includes('temporarily busy') ||
        normalized.includes('rate limit') ||
        normalized.includes('rate_limit')
      ) {
        const attempt = jobInfo.retryCount + 1;
        if (attempt <= maxRetries) {
          // Exponential backoff with Jitter (to prevent retry storms)
          const jitterMs = Math.floor(Math.random() * 1000);
          const delay = (Math.pow(2, attempt) * 1000) + jitterMs;
          
          this.logger.warn(`API Rate Limit Hit (${errorMessage}). Applying backoff and retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
          return delay; // Returning a number tells Bottleneck to wait X ms and retry
        }
      }
      // If we don't return a number, Bottleneck passes the error up the chain to the caller.
    });
  }

  async generateContent(params: GenerateContentParameters, priority: number = 5): Promise<GenerateContentResponse> {
    return this.limiter.schedule({ priority }, () => this.ai.models.generateContent(params));
  }
}
