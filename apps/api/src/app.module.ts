import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv, type Env } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { RedisModule } from './realtime/redis.module';
import { RealtimeModule } from './realtime/realtime.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ParticipantModule } from './participants/participant.module';
import { ActivityModule } from './activities/activity.module';   // ← Sprint 3
import { ResponseModule } from './responses/response.module';   // ← Sprint 3

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
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
    ActivityModule,   // ← Sprint 3
    ResponseModule,   // ← Sprint 3
  ],
})
export class AppModule {}