import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { Env } from '../config/env.validation';

/**
 * Owns the Redis connections for the app:
 *  - `client` for general commands (health ping, live counters, rate limiting)
 *  - `pubClient` / `subClient` for the Socket.IO Redis adapter (created lazily)
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;
  private _pubClient?: Redis;
  private _subClient?: Redis;

  constructor(private readonly config: ConfigService<Env, true>) {
    const url = this.config.get('REDIS_URL', { infer: true });
    this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Connected to Redis');
    } catch (err) {
      this.logger.error(
        `Failed to connect to Redis: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  /** Duplicated connections required by @socket.io/redis-adapter. */
  getAdapterClients(): { pubClient: Redis; subClient: Redis } {
    if (!this._pubClient) {
      this._pubClient = this.client.duplicate();
      this._pubClient.on('error', (err) => this.logger.error(`pubClient error: ${err.message}`));
    }
    if (!this._subClient) {
      this._subClient = this.client.duplicate();
      this._subClient.on('error', (err) => this.logger.error(`subClient error: ${err.message}`));
    }
    return { pubClient: this._pubClient, subClient: this._subClient };
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([
      this.client.quit(),
      this._pubClient?.quit(),
      this._subClient?.quit(),
    ]);
  }
}
