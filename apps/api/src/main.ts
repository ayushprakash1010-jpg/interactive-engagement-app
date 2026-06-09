import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import type { Env } from './config/env.validation';
import { RedisService } from './realtime/redis.service';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

async function bootstrap(): Promise<void> {
  // bufferLogs so early logs are flushed through the pino logger once available.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Route all framework + app logs through structured pino logging.
  const logger = app.get(PinoLogger);
  app.useLogger(logger);

  const config = app.get(ConfigService<Env, true>);
  const webOrigin = config.get('WEB_ORIGIN', { infer: true });
  const port = config.get('PORT', { infer: true });

  // Security headers. crossOriginResourcePolicy relaxed so the separate web
  // origin can consume API responses (CORS already restricts origins).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({ origin: webOrigin, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  // Wire Socket.IO to the Redis adapter for cross-instance broadcasts.
  const redis = app.get(RedisService);
  const ioAdapter = new RedisIoAdapter(app, redis, webOrigin);
  await ioAdapter.connect();
  app.useWebSocketAdapter(ioAdapter);

  await app.listen(port, '0.0.0.0');
  logger.log(`API listening on http://localhost:${port} (CORS: ${webOrigin})`);
}

void bootstrap();
