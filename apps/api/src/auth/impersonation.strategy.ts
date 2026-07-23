import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from './jwt.strategy';

@Injectable()
export class ImpersonationStrategy extends PassportStrategy(Strategy, 'impersonation') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SESSION_SECRET || 'fallback-dev-secret-do-not-use-in-prod',
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    if (!payload.isImpersonating) {
      throw new UnauthorizedException('Not an impersonation token');
    }

    return {
      id: payload.sub,
      _id: payload.sub,
      auth0Sub: payload.auth0Sub || '',
      name: payload.name || 'Impersonated User',
      email: payload.email || '',
      role: 'host', // Support impersonation acts as a standard host
      organizationId: payload.organizationId,
      isImpersonating: true,
      impersonatorId: payload.impersonatorId,
      impersonatorEmail: payload.impersonatorEmail,
    };
  }
}
