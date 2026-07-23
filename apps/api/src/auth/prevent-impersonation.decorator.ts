import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { PreventImpersonationInterceptor } from './prevent-impersonation.interceptor';

export const PREVENT_IMPERSONATION_KEY = 'iep:preventImpersonation';
export const ALLOW_IMPERSONATION_KEY = 'iep:allowImpersonation';

/**
 * Denies access to this endpoint if the current user is an admin impersonating a host.
 * Use this on critical destructive actions like deleting organizations, transferring billing, etc.
 */
export function PreventImpersonation() {
  return SetMetadata(PREVENT_IMPERSONATION_KEY, true);
}

/**
 * Explicitly allows an impersonated session to perform a mutation (POST/PUT/PATCH/DELETE).
 * Use strictly for necessary troubleshooting flows (e.g., stopping an impersonation session).
 */
export function AllowImpersonationMutation() {
  return SetMetadata(ALLOW_IMPERSONATION_KEY, true);
}
