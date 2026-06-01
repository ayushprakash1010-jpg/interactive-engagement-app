'use client';

import * as React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Client-side providers wrapping the whole app:
 *  - UserProvider: exposes the Auth0 session to useUser()/useAuth().
 *  - QueryClientProvider: TanStack Query cache for all API data fetching.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session (stable across re-renders).
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </UserProvider>
  );
}
