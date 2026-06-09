import { SetMetadata } from '@nestjs/common';

export type AppRole = 'host' | 'admin';

/** Metadata key under which required roles are stored on a handler/controller. */
export const ROLES_KEY = 'iep:roles';

/**
 * Restrict a route to one or more roles. Must be combined with JwtAuthGuard
 * (which attaches req.user) and RolesGuard.
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *   @Delete(':id')
 *   removeAnyEvent() { ... }
 */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
