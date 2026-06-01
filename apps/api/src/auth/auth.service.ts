// apps/api/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';

/**
 * Thin service for auth-related business logic.
 * JWT verification and upsert live in JwtStrategy.validate().
 * This service is the correct extension point for future work:
 * token revocation, role promotion, audit logging, etc.
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Returns the full user document for a verified Auth0 subject.
   * Use this when a handler needs fields beyond what req.user carries
   * (plan, createdAt, etc.) without importing UsersModule directly.
   */
  async getProfile(auth0Sub: string): Promise<UserDocument | null> {
    return this.usersService.findByAuth0Sub(auth0Sub);
  }
}