import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
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
}
