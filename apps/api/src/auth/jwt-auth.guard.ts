// apps/api/src/auth/jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', 'impersonation']) {
  private readonly logger = new Logger(JwtAuthGuard.name);
  /**
   * Delegates to Passport's 'jwt' strategy (registered by JwtStrategy).
   * Returning super.canActivate() lets Passport run the full
   * verify → validate pipeline before the route handler executes.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  /**
   * Called by Passport after canActivate resolves.
   *
   * Normalises every failure mode into a single 401 so callers never
   * receive a raw Passport error object or an empty 500.
   *
   * Failure scenarios covered:
   *   - No Authorization header          → info = 'No auth token'
   *   - Malformed / tampered token       → info = JsonWebTokenError
   *   - Expired token                    → info = TokenExpiredError
   *   - Wrong audience / issuer          → info = JsonWebTokenError
   *   - validate() threw                 → err  = the thrown error
   */
  handleRequest<TUser = any>(
    err: Error | null,
    user: TUser | false,
    info: Error | string | null,
  ): TUser {
    if (err || !user) {
      const detail =
        info instanceof Error
          ? info.message
          : typeof info === 'string'
            ? info
            : 'No token provided';

      // Always log the real reason server-side (the HTTP response stays generic
      // in production). This is what to read in `docker compose logs api`.
      this.logger.warn(
        `JWT validation failed: ${detail}${err ? ` (err: ${err.message})` : ''}`,
      );

      throw new UnauthorizedException(
        process.env.NODE_ENV !== 'production'
          ? `JWT validation failed: ${detail}`
          : 'Unauthorized',
      );
    }

    return user;
  }
}