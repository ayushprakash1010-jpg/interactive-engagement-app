import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  'https://iep.app/email'?: string;
  'https://iep.app/name'?: string;
  aud: string | string[];
  iss: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
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
    const rawIssuer = configService.getOrThrow<string>('AUTH0_ISSUER_BASE_URL');
    const issuer = rawIssuer.endsWith('/') ? rawIssuer : `${rawIssuer}/`;
    const audience = configService.getOrThrow<string>('AUTH0_AUDIENCE');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token is missing the sub claim');
    }

    const email =
      payload.email ??
      payload['https://iep.app/email'] ??
      `${payload.sub}@users.noreply.iep`;

    const name =
      payload.name ??
      payload['https://iep.app/name'] ??
      (email.includes('@') ? email.split('@')[0] : '') ??
      'Host';

    const user = await this.usersService.upsert({
      auth0Sub: payload.sub,
      name: name || 'Host',
      email,
    });

    const userId = user._id.toString();

    return {
      id: userId,
      _id: userId,
      auth0Sub: user.auth0Sub,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}