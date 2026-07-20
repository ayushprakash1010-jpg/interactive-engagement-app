import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../users/users.service';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  'https://iep.app/email'?: string;
  'https://iep.app/name'?: string;
  'https://iep.app/email_verified'?: boolean;
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
  emailVerified?: boolean;
  role: 'host' | 'admin' | 'support';
  organizationId?: string;
  isImpersonating?: boolean;
  impersonatorId?: string;
  impersonatorEmail?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  private readonly issuerUrl: string;
  
  // LRU cache to prevent /userinfo rate limiting
  private readonly userInfoFailureCache = new Map<string, number>();
  private readonly USERINFO_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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
      passReqToCallback: true,
    });
    this.issuerUrl = issuer;
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token is missing the sub claim');
    }

    // 1. Look up the MongoDB user using stable auth0Sub
    const existingUser = await this.usersService.findByAuth0Sub(payload.sub);
    
    const dbHasRealProfile = existingUser && existingUser.email && !existingUser.email.endsWith('@users.noreply.iep');
    
    let email = existingUser?.email;
    let name = existingUser?.name;
    let skipProfileUpdate = false;
    let emailVerified = payload.email_verified ?? payload['https://iep.app/email_verified'];

    // 2. If MongoDB already has a complete real profile, use it and do not call /userinfo
    if (dbHasRealProfile) {
      skipProfileUpdate = true;
    } else {
      // 3. If trusted validated token claims already contain a usable real email/name, use those
      let tokenEmail = payload.email ?? payload['https://iep.app/email'];
      let tokenName = payload.name ?? payload['https://iep.app/name'];
      
      const tokenHasRealProfile = tokenEmail && !tokenEmail.endsWith('@users.noreply.iep');
      
      if (tokenHasRealProfile) {
        email = tokenEmail;
        name = tokenName ?? (tokenEmail.includes('@') ? tokenEmail.split('@')[0] : 'Host');
        // Profile is being upgraded from token claims
      } else {
        // 4. Only if trusted token claims are incomplete and MongoDB profile is incomplete, call Auth0 /userinfo
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        const lastFailure = this.userInfoFailureCache.get(payload.sub) || 0;
        const now = Date.now();
        
        if (token && (now - lastFailure) > this.USERINFO_CACHE_TTL) {
          try {
            const response = await fetch(`${this.issuerUrl}userinfo`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              const userInfo = await response.json() as { email?: string, name?: string, email_verified?: boolean };
              
              if (userInfo.email) {
                email = userInfo.email;
                name = userInfo.name ?? name;
                if (userInfo.email_verified !== undefined) {
                  emailVerified = userInfo.email_verified;
                }
              } else {
                this.userInfoFailureCache.set(payload.sub, now);
                this.logger.warn(`Auth0 /userinfo succeeded but returned no email for ${payload.sub}`);
              }
            } else {
              this.userInfoFailureCache.set(payload.sub, now);
              this.logger.error(`Failed to fetch userinfo from Auth0 for ${payload.sub}: Status ${response.status} ${response.statusText}`);
            }
          } catch (e: any) {
            this.userInfoFailureCache.set(payload.sub, now);
            this.logger.error(`Error fetching userinfo from Auth0 for ${payload.sub}: ${e.message}`);
          }
        }
      }
    }

    // Handle email_verified logging
    if (emailVerified === false) {
      this.logger.warn(`User ${payload.sub} has an unverified email: ${email}`);
    }

    // 5. Final fallback if everything fails
    const isStillIncomplete = !email || email.endsWith('@users.noreply.iep');
    if (isStillIncomplete) {
      email = email ?? `${payload.sub}@users.noreply.iep`;
      name = name ?? (email.includes('@') ? email.split('@')[0] : 'Host');
      
      if (existingUser && existingUser.email === email && existingUser.name === name) {
        skipProfileUpdate = true; // DB already has this exact fallback, don't rewrite
      }
    }

    // Synchronize to DB
    const user = await this.usersService.upsert({
      auth0Sub: payload.sub,
      name: name || 'Host',
      email: email as string,
    }, { skipProfileUpdate });

    if (user.isSuspended) {
      this.logger.warn(`Rejected suspended user: ${user.email} (${user.auth0Sub})`);
      throw new UnauthorizedException('User account is suspended');
    }

    const userId = user._id.toString();

    return {
      id: userId,
      _id: userId,
      auth0Sub: user.auth0Sub,
      name: user.name,
      email: user.email,
      emailVerified,
      role: user.role,
      organizationId: user.organizationId?.toString(),
    };
  }
}