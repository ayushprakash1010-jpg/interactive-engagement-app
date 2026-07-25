'use client';

/**
 * use-plan.ts
 *
 * Fetches the current org's entitlements and monthly usage from the API.
 * Exposes a unified `plan` context consumed by <UpgradeGate> and billing UI.
 *
 * Caches results in module-level state so multiple components don't
 * each trigger their own fetch.
 */
import * as React from 'react';
import { apiFetch } from '@/lib/events-api';

// ── Types (mirror the API response shape) ─────────────────────────────────────

export type PlanTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface EntitlementFeature {
  enabled: boolean;
  requiredPlan?: PlanTier;
}

export interface Entitlements {
  plan: PlanTier;
  planDisplayName: string;
  participants: { limit: number | null; used: number; percent: number };
  ai: { limit: number | null; used: number; percent: number };
  features: Record<string, EntitlementFeature>;
}

export interface PlanContext {
  entitlements: Entitlements | null;
  isLoading: boolean;
  error: Error | null;
  /** Convenience: check if the current org can use a feature */
  canUse: (feature: string) => boolean;
  /** Convenience: percentage of monthly participant limit used (0–100). null if unlimited. */
  participantUsagePercent: number | null;
  /** Convenience: percentage of monthly AI limit used (0–100). null if unlimited. */
  aiUsagePercent: number | null;
  refetch: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const PlanContext = React.createContext<PlanContext>({
  entitlements: null,
  isLoading: true,
  error: null,
  canUse: () => false,
  participantUsagePercent: null,
  aiUsagePercent: null,
  refetch: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [entitlements, setEntitlements] = React.useState<Entitlements | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [fetchKey, setFetchKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    async function load() {
      try {
        const ent = await apiFetch<Entitlements>('billing/entitlements');
        if (!mounted) return;
        setEntitlements(ent);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [fetchKey]);

  const canUse = React.useCallback(
    (feature: string): boolean => {
      if (!entitlements || !entitlements.features) return false;
      return entitlements.features[feature]?.enabled ?? false;
    },
    [entitlements],
  );

  const participantUsagePercent = React.useMemo(() => {
    return entitlements?.participants.percent ?? null;
  }, [entitlements]);

  const aiUsagePercent = React.useMemo(() => {
    return entitlements?.ai.percent ?? null;
  }, [entitlements]);

  const refetch = React.useCallback(() => setFetchKey((k) => k + 1), []);

  return (
    <PlanContext.Provider
      value={{
        entitlements,
        isLoading,
        error,
        canUse,
        participantUsagePercent,
        aiUsagePercent,
        refetch,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePlan(): PlanContext {
  return React.useContext(PlanContext);
}
