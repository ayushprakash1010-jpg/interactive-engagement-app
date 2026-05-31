import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from '../realtime/redis.service';

/** Terminus health indicator that PINGs Redis. */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.client.ping();
      const isHealthy = pong === 'PONG';
      const result = this.getStatus(key, isHealthy, { response: pong });
      if (isHealthy) {
        return result;
      }
      throw new HealthCheckError('Redis ping failed', result);
    } catch (error) {
      throw new HealthCheckError(
        'Redis ping failed',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : 'unknown error',
        }),
      );
    }
  }
}
