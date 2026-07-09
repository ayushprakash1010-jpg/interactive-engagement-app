import { GoogleGenAI, Schema } from '@google/genai';
import { z } from 'zod';
import { ProviderError, ParsingError, ValidationError } from '../errors';
import { AI_CONFIG } from '../config';
import { Telemetry } from '../telemetry';
import { AICache } from '../cache';
import { sanitizeContext } from '../security';

export abstract class BaseProvider {
  protected ai: GoogleGenAI;
  name: string;
  protected model: string;
  
  // In-flight deduplication cache
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(apiKey: string, name: string = 'Gemini 1.5 Pro', model: string = AI_CONFIG.defaultModel) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.name = name;
    this.model = model;
  }

  protected async executeGeminiRequest<T>(
    promptDef: { id: string, version: string, text: string },
    contextData: any,
    responseSchema: Schema,
    zodSchema: z.ZodType<T>,
    operationName: string,
    useCache: boolean = true
  ): Promise<T> {
    const requestId = crypto.randomUUID();
    const start = Date.now();
    
    // 1. Sanitize input context
    const sanitizedContext = sanitizeContext(contextData);
    
    // 2. Build final prompt string
    // Basic substitution logic (can be expanded if needed)
    let finalPrompt = promptDef.text;
    if (typeof sanitizedContext === 'object') {
      finalPrompt = finalPrompt.replace(/\{\{config\}\}|\{\{plan\}\}|\{\{drafts\}\}|\{\{intent\}\}|\{\{context\}\}/g, (match) => {
        if (match === '{{config}}' || match === '{{context}}') return JSON.stringify(sanitizedContext);
        if (match === '{{plan}}') return JSON.stringify(sanitizedContext.plan);
        if (match === '{{drafts}}') return JSON.stringify(sanitizedContext.drafts);
        if (match === '{{intent}}') return sanitizedContext.intent;
        return match;
      });
    }

    // 3. Cache & Deduplication Key
    const cacheKey = AICache.generateKey(operationName, promptDef.version, sanitizedContext, this.model);

    // 4. Check Cache
    if (useCache) {
      const cached = AICache.get<T>(cacheKey);
      if (cached) {
        Telemetry.recordTrace({
          requestId,
          provider: this.name,
          model: this.model,
          feature: operationName,
          promptVersion: promptDef.version,
          latency: Date.now() - start,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cacheHit: true,
          retryCount: 0,
          status: 'success',
          timestamp: new Date().toISOString()
        });
        return cached;
      }
    }

    // 5. Check In-Flight Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[${this.name}] Deduplicating in-flight request for ${operationName}`);
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // 6. Execute Request
    const requestPromise = this.doExecute<T>(finalPrompt, responseSchema, zodSchema, operationName, promptDef.version, requestId, start);
    
    this.pendingRequests.set(cacheKey, requestPromise);
    try {
      const result = await requestPromise;
      if (useCache) {
        AICache.set(cacheKey, result);
      }
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async doExecute<T>(
    prompt: string,
    responseSchema: Schema,
    zodSchema: z.ZodType<T>,
    operationName: string,
    promptVersion: string,
    requestId: string,
    start: number
  ): Promise<T> {
    let attempt = 0;
    const maxAttempts = AI_CONFIG.retryCount;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: AI_CONFIG.temperature,
            topP: AI_CONFIG.topP,
            topK: AI_CONFIG.topK,
            maxOutputTokens: AI_CONFIG.maxOutputTokens
          }
        });

        const text = response.text;
        if (!text) {
          throw new ParsingError('Empty response from Gemini.');
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          throw new ParsingError('Response was not valid JSON.');
        }

        const validationResult = zodSchema.safeParse(parsed);
        if (!validationResult.success) {
          throw new ValidationError('Response failed schema validation.', validationResult.error);
        }

        const usage = response.usageMetadata;
        
        Telemetry.recordTrace({
          requestId,
          provider: this.name,
          model: this.model,
          feature: operationName,
          promptVersion,
          latency: Date.now() - start,
          inputTokens: usage?.promptTokenCount || 0,
          outputTokens: usage?.candidatesTokenCount || 0,
          totalTokens: usage?.totalTokenCount || 0,
          cacheHit: false,
          retryCount: attempt - 1,
          status: 'success',
          timestamp: new Date().toISOString()
        });

        return validationResult.data;

      } catch (error) {
        lastError = error;
        console.warn(`[${this.name}] Attempt ${attempt} failed, retrying...`, error);
      }
    }

    Telemetry.recordTrace({
      requestId,
      provider: this.name,
      model: this.model,
      feature: operationName,
      promptVersion,
      latency: Date.now() - start,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cacheHit: false,
      retryCount: attempt - 1,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: lastError instanceof Error ? lastError.message : String(lastError)
    });

    if (lastError instanceof ValidationError || lastError instanceof ParsingError) {
      throw lastError;
    }
    throw new ProviderError(`Failed to ${operationName} with Gemini after ${maxAttempts} attempts.`, this.name, lastError);
  }
}
