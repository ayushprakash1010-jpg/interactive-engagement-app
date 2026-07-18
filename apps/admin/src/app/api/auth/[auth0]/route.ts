import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

/**
 * Auth0 route handlers for the Pulse Admin Console.
 * Uses a dedicated Auth0 Application (separate client_id/secret from apps/web).
 * Same tenant and API audience — Auth0_AUDIENCE must match the NestJS API audience
 * so the access token is accepted by JwtAuthGuard.
 *
 * Mounts:
 *   /api/auth/login    → Auth0 Universal Login
 *   /api/auth/logout   → clears the session
 *   /api/auth/callback → exchanges the code for tokens
 *   /api/auth/me       → current user JSON (used by useUser())
 */
const authorizationParams = {
  audience: process.env.AUTH0_AUDIENCE,
  scope: 'openid profile email',
};

export const GET = handleAuth({
  login: handleLogin({ authorizationParams }),
});
