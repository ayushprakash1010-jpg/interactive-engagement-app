'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// The Context stores the key-value map of evaluated flags
const FeatureFlagsContext = createContext<Record<string, boolean>>({});

/**
 * Hook to evaluate a feature flag safely.
 * @param key The feature flag key to evaluate
 * @param defaultValue The safe fallback if the flag is missing or the service is down
 */
export function useFeatureFlag(key: string, defaultValue: boolean = false): boolean {
  const flags = useContext(FeatureFlagsContext);
  
  if (key in flags && flags[key] !== undefined) {
    return flags[key] as boolean;
  }
  
  return defaultValue;
}

interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Only attempt to load flags if we have an active Host session (has token)
    const loadFlags = async () => {
      try {
        const res = await fetch('/api/proxy/api/feature-flags/evaluate');
        if (res.ok) {
          const data = await res.json();
          setFlags(data);
        } else if (res.status !== 401) {
          console.warn('Feature flags request returned non-OK status:', res.status);
        }
      } catch (err) {
        console.error('Failed to load feature flags, falling back to defaults', err);
      }
    };

    loadFlags();
  }, []);

  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
