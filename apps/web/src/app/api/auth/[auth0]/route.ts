import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

/**
 * Auth0 route handlers (App Router). Mounts:
 *   /api/auth/login    -> Universal Login (email/password + Google)
 *   /api/auth/signup   -> Universal Login pre-set to the sign-up screen
 *   /api/auth/logout   -> clears the session
 *   /api/auth/callback -> exchanges the code for tokens
 *   /api/auth/me       -> current user JSON (used by useUser())
 *
 * `audience` requests an access token for apps/api so the proxy can forward
 * it as a Bearer token; `scope` keeps the standard OIDC claims.
 */
const authorizationParams = {
  audience: process.env.AUTH0_AUDIENCE,
  scope: 'openid profile email',
};

export const GET = handleAuth({
  login: handleLogin({ authorizationParams }),
  // "Start here" CTA: screen_hint sends new users straight to registration.
  signup: handleLogin({
    authorizationParams: { ...authorizationParams, screen_hint: 'signup' },
  }),
});
