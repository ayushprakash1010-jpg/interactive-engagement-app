import { Module, forwardRef } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AiModule } from '../ai/ai.module';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health';

@Module({
  imports: [TerminusModule, forwardRef(() => AiModule)],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
