import { createHash } from 'crypto';
import { AI_CONFIG } from './config';

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

class AICacheManager {
  private cache = new Map<string, CacheItem<any>>();

  generateKey(feature: string, promptVersion: string, inputData: any, model: string): string {
    const dataString = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);
    const hash = createHash('sha256').update(dataString).digest('hex');
    return `${feature}:${promptVersion}:${model}:${hash}`;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > AI_CONFIG.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const AICache = new AICacheManager();
