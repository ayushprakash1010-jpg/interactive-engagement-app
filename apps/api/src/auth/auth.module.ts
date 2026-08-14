// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { ImpersonationStrategy } from './impersonation.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PreventImpersonationInterceptor } from './prevent-impersonation.interceptor';
import { AuthController } from './auth.controller';

/**
 * AuthModule wires together Passport, the Users dependency, and the
 * auth primitives (strategy + guard + service) that the rest of the app uses.
 *
 * JwtStrategy verifies Auth0 access tokens against the tenant JWKS and
 * upserts the host into `users`; JwtAuthGuard (AuthGuard('jwt')) drives it.
 */
@Module({
  imports: [
    // ConfigModule is global in AppModule; listed here so AuthModule
    // can be instantiated in isolation during unit tests.
    ConfigModule,

    // Registers Passport and sets 'jwt' as the default strategy, so
    // AuthGuard() (no argument) resolves to JwtStrategy.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('SESSION_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),

    // Provides UsersService — required by JwtStrategy.validate()
    UsersModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ImpersonationStrategy,
    JwtAuthGuard,
    RolesGuard,
    PreventImpersonationInterceptor,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtAuthGuard,   // controllers in other modules: @UseGuards(JwtAuthGuard)
    RolesGuard,     // controllers: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles()
    PassportModule, // exposes AuthGuard() to importing modules
    JwtModule,
    PreventImpersonationInterceptor,
  ],
})
export class AuthModule {}