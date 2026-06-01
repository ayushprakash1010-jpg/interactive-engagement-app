// apps/api/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string; // Auth0 user ID  (e.g. "auth0|abc123")
  name?: string; // set by Auth0 if included in token
  email?: string; // standard OIDC email claim
  'https://iep.app/email'?: string; // custom namespace fallback
  aud: string | string[];
  iss: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  _id: string;
  auth0Sub: string;
  name: string;
  email: string;
  role: 'host' | 'admin';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    // Normalise issuer URL — Auth0 requires a trailing slash.
    const rawIssuer = configService.getOrThrow<string>('AUTH0_ISSUER_BASE_URL');
    const issuer = rawIssuer.endsWith('/') ? rawIssuer : `${rawIssuer}/`;
    const audience = configService.getOrThrow<string>('AUTH0_AUDIENCE');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Fetch the tenant's signing key from JWKS, keyed by the token's `kid`.
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}.well-known/jwks.json`,
      }),

      audience,
      issuer,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  /**
   * Runs after the token signature/issuer/audience/expiry have been verified.
   * Upserts the host into `users` and returns the shape attached to req.user.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token is missing the sub claim');
    }

    const email = payload.email ?? payload['https://iep.app/email'] ?? '';

    const user = await this.usersService.upsert({
      auth0Sub: payload.sub,
      name: payload.name ?? email.split('@')[0] ?? 'Host',
      email,
    });

    return {
      _id: (user._id as unknown as string).toString(),
      auth0Sub: user.auth0Sub,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
