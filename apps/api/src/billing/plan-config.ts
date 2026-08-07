/**
 * plan-config.ts
 *
 * Single source of truth for all plan tiers and their limits/features.
 *
 * DESIGN NOTE: This is intentionally a static record for MVP.
 * When a DB-driven plan engine is needed (Phase 8+), replace
 * `PLAN_CONFIGS` with a DB fetch in PlanDefinitionService.getPlanConfig()
 * — all callers go through that service, so this file is the
 * only thing that changes.
 */

export type PlanTier = 'free' | 'basic' | 'pro' | 'enterprise';

/** Feature registry for compile-time safety */
export enum FeatureKey {
  QA_MODERATION = 'qaModeration',
  CUSTOM_BRANDING = 'customBranding',
  ADVANCED_ANALYTICS = 'advancedAnalytics',
  DATA_EXPORT = 'dataExport',
  PRIORITY_SUPPORT = 'prioritySupport',
}

/** Hard quota limits. null = unlimited. */
export interface PlanLimits {
  readonly participantsPerMonth: number | null;
  readonly aiRequestsPerMonth: number | null;
}

/** Boolean feature entitlements mapped by FeatureKey. */
export type PlanFeatures = Readonly<Record<FeatureKey, boolean>>;

export interface PlanConfig {
  readonly tier: PlanTier;
  readonly displayName: string;
  readonly limits: PlanLimits;
  readonly features: PlanFeatures;
}

export const PLAN_CONFIGS: Readonly<Record<PlanTier, PlanConfig>> = Object.freeze({
  free: Object.freeze({
    tier: 'free',
    displayName: 'Free',
    limits: Object.freeze({
      participantsPerMonth: 50,
      aiRequestsPerMonth: 25,
    }),
    features: Object.freeze({
      [FeatureKey.QA_MODERATION]: false,
      [FeatureKey.CUSTOM_BRANDING]: false,
      [FeatureKey.ADVANCED_ANALYTICS]: false,
      [FeatureKey.DATA_EXPORT]: false,
      [FeatureKey.PRIORITY_SUPPORT]: false,
    }),
  }),

  basic: Object.freeze({
    tier: 'basic',
    displayName: 'Basic',
    limits: Object.freeze({
      participantsPerMonth: null, // unlimited
      aiRequestsPerMonth: null,   // unlimited
    }),
    features: Object.freeze({
      [FeatureKey.QA_MODERATION]: false,
      [FeatureKey.CUSTOM_BRANDING]: false,
      [FeatureKey.ADVANCED_ANALYTICS]: false,
      [FeatureKey.DATA_EXPORT]: true,
      [FeatureKey.PRIORITY_SUPPORT]: false,
    }),
  }),

  pro: Object.freeze({
    tier: 'pro',
    displayName: 'Pro',
    limits: Object.freeze({
      participantsPerMonth: null,
      aiRequestsPerMonth: null,
    }),
    features: Object.freeze({
      [FeatureKey.QA_MODERATION]: true,
      [FeatureKey.CUSTOM_BRANDING]: true,
      [FeatureKey.ADVANCED_ANALYTICS]: true,
      [FeatureKey.DATA_EXPORT]: true,
      [FeatureKey.PRIORITY_SUPPORT]: false,
    }),
  }),

  enterprise: Object.freeze({
    tier: 'enterprise',
    displayName: 'Enterprise',
    limits: Object.freeze({
      participantsPerMonth: null,
      aiRequestsPerMonth: null,
    }),
    features: Object.freeze({
      [FeatureKey.QA_MODERATION]: true,
      [FeatureKey.CUSTOM_BRANDING]: true,
      [FeatureKey.ADVANCED_ANALYTICS]: true,
      [FeatureKey.DATA_EXPORT]: true,
      [FeatureKey.PRIORITY_SUPPORT]: true,
    }),
  }),
});

/** Helper: is the given string a valid plan tier? */
export function isValidPlanTier(value: string): value is PlanTier {
  return value in PLAN_CONFIGS;
}
