'use client';

/**
 * upgrade-gate.tsx
 *
 * Wraps any UI section that requires a higher plan tier.
 * When the current org lacks the feature:
 *   - Renders children in a blurred, non-interactive overlay
 *   - Shows an "Upgrade" badge + CTA
 *
 * Usage:
 *   <UpgradeGate feature="qaModeration" requiredPlan="pro">
 *     <ModerationToggle />
 *   </UpgradeGate>
 */
import * as React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { usePlan, type Entitlements } from '@/lib/use-plan';
import { cn } from '@/lib/utils';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
  free: 'from-slate-500 to-slate-600',
  basic: 'from-blue-500 to-blue-600',
  pro: 'from-violet-500 to-purple-600',
  enterprise: 'from-amber-500 to-orange-600',
};

interface UpgradeGateProps {
  /** The feature key to check against the org's entitlements */
  feature: keyof Omit<Entitlements, 'plan' | 'planDisplayName'>;
  /** The minimum plan that enables this feature (for the CTA label) */
  requiredPlan: 'basic' | 'pro' | 'enterprise';
  /** Children rendered normally when the feature is allowed */
  children: React.ReactNode;
  /** Optional custom CTA label */
  ctaLabel?: string;
  /** Optional class for the wrapper */
  className?: string;
}

export function UpgradeGate({
  feature,
  requiredPlan,
  children,
  ctaLabel,
  className,
}: UpgradeGateProps) {
  const { canUse, isLoading } = usePlan();

  // While loading, render children normally (avoid flash of gate)
  if (isLoading) return <>{children}</>;

  const hasAccess = canUse(feature);

  // User has access — render children as-is
  if (hasAccess) return <>{children}</>;

  const label = PLAN_LABELS[requiredPlan] ?? requiredPlan;
  const gradient = PLAN_COLORS[requiredPlan] ?? PLAN_COLORS.pro;
  const defaultCta = `Upgrade to ${label}`;

  return (
    <div className={cn('relative', className)}>
      {/* Blurred, non-interactive children */}
      <div
        className="pointer-events-none select-none blur-[3px] opacity-60"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-white/10',
            'bg-[#0d0d14]/90 backdrop-blur-xl shadow-2xl',
            'px-6 py-5 flex flex-col items-center gap-3 text-center max-w-xs w-full mx-4',
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              `bg-gradient-to-br ${gradient}`,
            )}
          >
            <Lock className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>

          {/* Text */}
          <div>
            <p className="text-sm font-semibold text-white">
              {PLAN_LABELS[requiredPlan]} feature
            </p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              This feature is available on the{' '}
              <span className="text-white font-medium">{label}</span> plan and above.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/billing"
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg',
              'text-xs font-semibold text-white transition-all duration-200',
              `bg-gradient-to-r ${gradient} hover:opacity-90 hover:scale-[1.02]`,
              'shadow-lg',
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {ctaLabel ?? defaultCta}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
