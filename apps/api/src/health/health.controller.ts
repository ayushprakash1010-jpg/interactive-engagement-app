import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { GeminiProvider } from '../ai/gemini.provider';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly gemini: GeminiProvider,
  ) {}

  /**
   * Combined check (kept for backward compatibility — the web "/" page and
   * docker-compose use it): Mongo and Redis must both respond.
   */
  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  /**
   * Liveness probe: is the process up and the event loop responsive? Does NOT
   * touch dependencies, so a transient Mongo/Redis blip won't get the container
   * killed and restarted. Use for Kubernetes/Fly livenessProbe.
   */
  @Get('live')
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  /**
   * Readiness probe: should this instance receive traffic right now? Requires
   * Mongo and Redis to be reachable. Use for Kubernetes/Fly readinessProbe and
   * load-balancer health checks.
   */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.redis.pingCheck('redis'),
    ]);
  }

  /**
   * AI Queue metrics endpoint
   * Exposes current queue lengths, wait times, and reservoir status.
   */
  @Get('ai')
  async getAiMetrics() {
    const limiter = this.gemini.limiter;
    const reservoir = await limiter.currentReservoir();
    return {
      queueLength: limiter.queued(),
      running: limiter.running(),
      reservoir: reservoir,
      status: limiter.empty() ? 'empty' : 'processing',
    };
  }
}
