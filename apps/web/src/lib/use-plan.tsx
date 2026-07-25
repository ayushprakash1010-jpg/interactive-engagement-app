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

export interface Entitlements {
  plan: PlanTier;
  planDisplayName: string;
  qaModeration: boolean;
  customBranding: boolean;
  advancedAnalytics: boolean;
  dataExport: boolean;
  prioritySupport: boolean;
}

export interface UsageData {
  month: string;
  plan: PlanTier;
  planDisplayName: string;
  usage: {
    participantsUsed: number;
    aiRequests: number;
    exports: number;
  };
  limits: {
    participantsPerMonth: number | null;
    aiRequestsPerMonth: number | null;
  };
}

export interface PlanContext {
  entitlements: Entitlements | null;
  usage: UsageData | null;
  isLoading: boolean;
  error: Error | null;
  /** Convenience: check if the current org can use a feature */
  canUse: (feature: keyof Omit<Entitlements, 'plan' | 'planDisplayName'>) => boolean;
  /** Convenience: percentage of monthly participant limit used (0–100). null if unlimited. */
  participantUsagePercent: number | null;
  /** Convenience: percentage of monthly AI limit used (0–100). null if unlimited. */
  aiUsagePercent: number | null;
  refetch: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const PlanContext = React.createContext<PlanContext>({
  entitlements: null,
  usage: null,
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
  const [usage, setUsage] = React.useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [fetchKey, setFetchKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    async function load() {
      try {
        const [ent, usg] = await Promise.all([
          apiFetch<Entitlements>('billing/entitlements'),
          apiFetch<UsageData>('billing/usage'),
        ]);
        if (!mounted) return;
        setEntitlements(ent);
        setUsage(usg);
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
    (feature: keyof Omit<Entitlements, 'plan' | 'planDisplayName'>): boolean => {
      if (!entitlements) return false;
      return entitlements[feature];
    },
    [entitlements],
  );

  const participantUsagePercent = React.useMemo(() => {
    if (!usage) return null;
    const limit = usage.limits.participantsPerMonth;
    if (limit === null) return null;
    return Math.min(100, Math.round((usage.usage.participantsUsed / limit) * 100));
  }, [usage]);

  const aiUsagePercent = React.useMemo(() => {
    if (!usage) return null;
    const limit = usage.limits.aiRequestsPerMonth;
    if (limit === null) return null;
    return Math.min(100, Math.round((usage.usage.aiRequests / limit) * 100));
  }, [usage]);

  const refetch = React.useCallback(() => setFetchKey((k) => k + 1), []);

  return (
    <PlanContext.Provider
      value={{
        entitlements,
        usage,
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
