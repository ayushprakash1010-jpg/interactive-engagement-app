/**
 * plan-config.ts
 *
 * Single source of truth for all plan tiers and their limits/features.
 *
 * DESIGN NOTE: This is intentionally a static record for MVP.
 * When a DB-driven plan engine is needed (Phase 8+), replace
 * `PLAN_CONFIGS` with a DB fetch in PlanService.getPlanConfig()
 * — all callers go through that service, so this file is the
 * only thing that changes.
 */

export type PlanTier = 'free' | 'basic' | 'pro' | 'enterprise';

/** Hard quota limits. null = unlimited. */
export interface PlanLimits {
  participantsPerMonth: number | null;
  aiRequestsPerMonth: number | null;
}

/** Boolean feature entitlements. */
export interface PlanFeatures {
  qaModeration: boolean;
  customBranding: boolean;
  advancedAnalytics: boolean;
  dataExport: boolean;
  prioritySupport: boolean;
}

export interface PlanConfig {
  tier: PlanTier;
  displayName: string;
  limits: PlanLimits;
  features: PlanFeatures;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    tier: 'free',
    displayName: 'Free',
    limits: {
      participantsPerMonth: 50,
      aiRequestsPerMonth: 10,
    },
    features: {
      qaModeration: false,
      customBranding: false,
      advancedAnalytics: false,
      dataExport: false,
      prioritySupport: false,
    },
  },

  basic: {
    tier: 'basic',
    displayName: 'Basic',
    limits: {
      participantsPerMonth: null, // unlimited
      aiRequestsPerMonth: null,   // unlimited
    },
    features: {
      qaModeration: false,
      customBranding: false,
      advancedAnalytics: false,
      dataExport: true,
      prioritySupport: false,
    },
  },

  pro: {
    tier: 'pro',
    displayName: 'Pro',
    limits: {
      participantsPerMonth: null,
      aiRequestsPerMonth: null,
    },
    features: {
      qaModeration: true,
      customBranding: true,
      advancedAnalytics: true,
      dataExport: true,
      prioritySupport: false,
    },
  },

  enterprise: {
    tier: 'enterprise',
    displayName: 'Enterprise',
    limits: {
      participantsPerMonth: null,
      aiRequestsPerMonth: null,
    },
    features: {
      qaModeration: true,
      customBranding: true,
      advancedAnalytics: true,
      dataExport: true,
      prioritySupport: true,
    },
  },
};

/** Helper: is the given string a valid plan tier? */
export function isValidPlanTier(value: string): value is PlanTier {
  return value in PLAN_CONFIGS;
}
