import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { validateEnv, type Env } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HealthModule } from './health/health.module';
import { RedisModule } from './realtime/redis.module';
import { RealtimeModule } from './realtime/realtime.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ParticipantModule } from './participants/participant.module';
import { ActivityModule } from './activities/activity.module';
import { ResponseModule } from './responses/response.module';
import { QuestionsModule } from './questions/questions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isProd = config.get('NODE_ENV', { infer: true }) === 'production';
        return {
          pinoHttp: {
            level: isProd ? 'info' : 'debug',
            // Pretty, human-readable logs in dev; structured JSON in prod.
            transport: isProd
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
            // Correlate every request with an id (honors inbound header).
            genReqId: (req, res) => {
              const existing =
                (req.headers['x-request-id'] as string | undefined) ??
                (req.id as string | undefined);
              const id = existing ?? randomUUID();
              res.setHeader('x-request-id', id);
              return id;
            },
            // Never log secrets.
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
              ],
              remove: true,
            },
            // Health probes are noisy; drop them to trace level.
            customLogLevel: (_req, res, err) => {
              if (err || res.statusCode >= 500) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },
            autoLogging: {
              ignore: (req) =>
                req.url === '/health' ||
                req.url === '/live' ||
                req.url === '/ready',
            },
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
      }),
    }),
    RedisModule,
    RealtimeModule,
    HealthModule,
    EventsModule,
    UsersModule,
    AuthModule,
    ParticipantModule,
    ActivityModule,
    ResponseModule,
    QuestionsModule,
    AnalyticsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}