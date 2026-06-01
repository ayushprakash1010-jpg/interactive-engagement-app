'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

/**
 * Thin wrapper over Auth0's useUser() giving the app a stable `useAuth()`
 * surface (per the Sprint 1 plan). Adds convenience flags and the canonical
 * login/logout URLs so components don't hardcode the /api/auth/* paths.
 */
export function useAuth() {
  const { user, error, isLoading } = useUser();

  return {
    user,
    error,
    isLoading,
    isAuthenticated: !!user,
    loginUrl: '/api/auth/login',
    logoutUrl: '/api/auth/logout',
  };
}
