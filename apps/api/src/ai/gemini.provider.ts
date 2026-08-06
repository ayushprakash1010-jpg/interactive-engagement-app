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
    this.ai = new GoogleGenAI({ apiKey });

    // Rate Limit Queue: 14 requests per minute
    this.limiter = new Bottleneck({
      reservoir: 14,
      reservoirRefreshAmount: 14,
      reservoirRefreshInterval: 60 * 1000,
      
      // Ensure we don't bombard the API instantly even within the limit
      minTime: 200, 
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
        if (attempt <= 3) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.warn(`API Rate Limit Hit (${errorMessage}). Applying backoff and retrying in ${delay}ms... (Attempt ${attempt}/3)`);
          return delay; // Returning a number tells Bottleneck to wait X ms and retry
        }
      }
      // If we don't return a number, Bottleneck passes the error up the chain to the caller.
    });
  }

  async generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse> {
    return this.limiter.schedule(() => this.ai.models.generateContent(params));
  }
}
