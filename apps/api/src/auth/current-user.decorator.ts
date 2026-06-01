// apps/api/src/auth/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './jwt.strategy';

/**
 * Injects the authenticated user attached by JwtStrategy.validate().
 * Only meaningful on routes protected by JwtAuthGuard.
 *
 *   @Get()
 *   findAll(@CurrentUser() user: AuthenticatedUser) { ... }
 *
 * Pass a key to pluck a single field:  @CurrentUser('_id') hostId: string
 */
export const CurrentUser = createParamDecorator(
  (
    key: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;
    return key ? user?.[key] : user;
  },
);
