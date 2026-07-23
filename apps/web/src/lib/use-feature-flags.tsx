'use client';

import * as React from 'react';
import { apiFetch } from '@/lib/events-api';

type FeatureFlags = Record<string, boolean>;

const FeatureFlagsContext = React.createContext<{
  flags: FeatureFlags;
  loading: boolean;
  error: Error | null;
}>({ flags: {}, loading: true, error: null });

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = React.useState<FeatureFlags>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadFlags() {
      try {
        const data = await apiFetch<FeatureFlags>('feature-flags/evaluate');
        if (mounted) {
          setFlags(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFlags();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, error }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return React.useContext(FeatureFlagsContext);
}
