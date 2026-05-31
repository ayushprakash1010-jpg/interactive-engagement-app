import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/** Global so the health module and gateway share one set of connections. */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
