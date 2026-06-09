import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import type { Env } from '../config/env.validation';

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets (only meaningful when blocked). */
  retryAfter: number;
};

/**
 * Redis-backed fixed-window rate limiter (Sprint 7 security).
 *
 * A counter per key is INCR'd and given a TTL on first hit; once it exceeds the
 * configured max within the window, further requests are rejected until the key
 * expires. Backed by Redis so limits hold across horizontally-scaled API
 * instances. Used on the highest-volume participant socket actions
 * (qa:ask, activity:respond) keyed by both anonId and client IP.
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly windowSec: number;
  private readonly max: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.windowSec = this.config.get('RATE_LIMIT_WINDOW', { infer: true });
    this.max = this.config.get('RATE_LIMIT_MAX', { infer: true });
  }

  /**
   * Consume one unit against `bucket`. Returns whether the call is allowed.
   * On any Redis failure it fails OPEN (allows the request) so a Redis blip
   * never takes down participant interaction — rate limiting is a safeguard,
   * not a correctness primitive.
   */
  async consume(
    bucket: string,
    limit: number = this.max,
    windowSec: number = this.windowSec,
  ): Promise<RateLimitResult> {
    const key = `ratelimit:${bucket}`;

    try {
      const count = await this.redisService.client.incr(key);
      if (count === 1) {
        await this.redisService.client.expire(key, windowSec);
      }

      if (count > limit) {
        const ttl = await this.redisService.client.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          retryAfter: ttl > 0 ? ttl : windowSec,
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, limit - count),
        retryAfter: 0,
      };
    } catch (err) {
      this.logger.error(
        `Rate limiter Redis error for ${key}; failing open: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return { allowed: true, remaining: limit, retryAfter: 0 };
    }
  }

  /**
   * Convenience: enforce a limit against BOTH the participant (anonId) and the
   * client IP for a given action. Returns false if either bucket is exhausted.
   */
  async consumeForAction(
    action: string,
    anonId: string,
    ip: string | undefined,
  ): Promise<RateLimitResult> {
    const byAnon = await this.consume(`${action}:anon:${anonId}`);
    if (!byAnon.allowed) {
      return byAnon;
    }

    if (ip) {
      // Allow a higher ceiling per IP (shared NATs / classrooms) — 5x the
      // per-participant limit — so one network doesn't throttle a whole room.
      const byIp = await this.consume(`${action}:ip:${ip}`, this.max * 5);
      if (!byIp.allowed) {
        return byIp;
      }
    }

    return byAnon;
  }
}
