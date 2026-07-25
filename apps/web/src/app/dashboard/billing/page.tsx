'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  Zap,
  Users,
  Sparkles,
  Shield,
  Download,
  BarChart3,
  Palette,
  HeadphonesIcon,
  Building2,
  Crown,
  Star,
} from 'lucide-react';
import { usePlan } from '@/lib/use-plan';
import { UsageMeter } from '@/components/ui/usage-meter';
import { cn } from '@/lib/utils';

// ── Plan definitions ────────────────────────────────────────────────────────

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    tagline: 'Get started for free',
    icon: Star,
    gradient: 'from-slate-500 to-slate-600',
    glow: 'shadow-slate-500/20',
    features: {
      participants: '50 / month',
      events: 'Unlimited',
      ai: '10 / month',
      qaModeration: false,
      customBranding: false,
      advancedAnalytics: false,
      dataExport: false,
      prioritySupport: false,
    },
  },
  {
    key: 'basic',
    name: 'Basic',
    price: { monthly: 17, annual: 14 },
    tagline: 'For regular sessions',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
    features: {
      participants: 'Unlimited',
      events: 'Unlimited',
      ai: 'Unlimited',
      qaModeration: false,
      customBranding: false,
      advancedAnalytics: false,
      dataExport: true,
      prioritySupport: false,
    },
  },
  {
    key: 'pro',
    name: 'Pro',
    price: { monthly: 35, annual: 28 },
    tagline: 'For professional hosts',
    icon: Crown,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/25',
    badge: 'Most Popular',
    features: {
      participants: 'Unlimited',
      events: 'Unlimited',
      ai: 'Unlimited',
      qaModeration: true,
      customBranding: true,
      advancedAnalytics: true,
      dataExport: true,
      prioritySupport: false,
    },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    tagline: 'For large organizations',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
    features: {
      participants: 'Unlimited',
      events: 'Unlimited',
      ai: 'Unlimited',
      qaModeration: true,
      customBranding: true,
      advancedAnalytics: true,
      dataExport: true,
      prioritySupport: true,
    },
  },
] as const;

const FEATURE_ROWS = [
  { key: 'participants', label: 'Participants / month', icon: Users },
  { key: 'ai', label: 'AI generations / month', icon: Sparkles },
  { key: 'dataExport', label: 'Data export (CSV/PDF)', icon: Download },
  { key: 'qaModeration', label: 'Q&A moderation', icon: Shield },
  { key: 'advancedAnalytics', label: 'Advanced analytics', icon: BarChart3 },
  { key: 'customBranding', label: 'Custom branding', icon: Palette },
  { key: 'prioritySupport', label: 'Priority support', icon: HeadphonesIcon },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { entitlements, isLoading } = usePlan();
  const [billing, setBilling] = React.useState<'annual' | 'monthly'>('annual');

  const currentPlan = entitlements?.plan ?? 'free';

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Back nav */}
      <div className="px-6 pt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Plans & Billing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose your{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              plan
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Scale your interactive sessions. Upgrade any time, cancel any time.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mt-4">
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                billing === 'annual'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              Annual
              <span className="ml-2 text-xs text-emerald-400 font-semibold">Save 20%</span>
            </button>
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                billing === 'monthly'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* ── Current Usage (shown when on free plan) ────────────────────── */}
        {!isLoading && entitlements && currentPlan === 'free' && (
          <div className="bg-surface-sunken border border-white/5 rounded-2xl p-6 md:p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand/10 text-brand rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-white">Your Free Plan Usage</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              <UsageMeter
                label="Participants this month"
                used={entitlements.participants.used}
                limit={entitlements.participants.limit}
              />
              <UsageMeter
                label="AI requests this month"
                used={entitlements.ai.used}
                limit={entitlements.ai.limit}
              />
            </div>
          </div>
        )}

        {/* ── Pricing Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const price = billing === 'annual' ? plan.price.annual : plan.price.monthly;
            const Icon = plan.icon;

            return (
              <div
                key={plan.key}
                className={cn(
                  'relative rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300',
                  isCurrent
                    ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/30'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
                  plan.key === 'pro' && !isCurrent && 'border-violet-500/30',
                )}
              >
                {/* Popular badge */}
                {'badge' in plan && plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="space-y-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br', plan.gradient)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    {price === null ? (
                      <span className="text-2xl font-bold text-white">Custom</span>
                    ) : price === 0 ? (
                      <span className="text-2xl font-bold text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-white">${price}</span>
                        <span className="text-xs text-slate-400">/mo</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Key limits */}
                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {plan.features.participants} participants
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {plan.features.ai} AI generations
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 border-t border-white/5 pt-4 flex-1">
                  {FEATURE_ROWS.slice(2).map(({ key, label }) => {
                    const val = plan.features[key as keyof typeof plan.features];
                    const enabled = val === true;
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        {enabled ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className={enabled ? 'text-slate-300' : 'text-slate-600'}>{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div>
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl border border-white/10 text-center text-sm text-slate-400 font-medium">
                      Current Plan
                    </div>
                  ) : plan.key === 'enterprise' ? (
                    <a
                      href="mailto:hello@pulse.app?subject=Enterprise Plan Inquiry"
                      className={cn(
                        'block w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white transition-all',
                        'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 hover:scale-[1.01]',
                      )}
                    >
                      Contact Sales
                    </a>
                  ) : (
                    <button
                      className={cn(
                        'w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all',
                        `bg-gradient-to-r ${plan.gradient} hover:opacity-90 hover:scale-[1.01]`,
                        'shadow-lg',
                      )}
                      onClick={() => {
                        // TODO: Stripe checkout integration
                        alert(`Stripe checkout for ${plan.name} coming soon!`);
                      }}
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Full Feature Comparison Table ────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Full comparison</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left p-4 text-slate-400 font-medium w-40">Feature</th>
                  {PLANS.map((p) => (
                    <th
                      key={p.key}
                      className={cn(
                        'p-4 text-center font-semibold',
                        currentPlan === p.key ? 'text-violet-300' : 'text-white',
                      )}
                    >
                      {p.name}
                      {currentPlan === p.key && (
                        <span className="ml-1 text-xs text-violet-400">✓</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map(({ key, label, icon: RowIcon }, i) => (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-white/5 transition-colors hover:bg-white/[0.02]',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]',
                    )}
                  >
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <RowIcon className="w-3.5 h-3.5 text-slate-500" />
                        {label}
                      </div>
                    </td>
                    {PLANS.map((p) => {
                      const val = p.features[key as keyof typeof p.features];
                      const isStr = typeof val === 'string';
                      const enabled = val === true;

                      return (
                        <td key={p.key} className="p-4 text-center">
                          {isStr ? (
                            <span className={cn(
                              'text-xs font-medium',
                              val === 'Unlimited' ? 'text-emerald-400' : 'text-slate-300',
                            )}>
                              {val}
                            </span>
                          ) : enabled ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-700 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ / Footer note ────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-600 pb-8">
          All prices in USD. Annual plans billed annually. You can upgrade or downgrade at any time.
          Enterprise pricing varies by team size and requirements.
        </p>
      </div>
    </div>
  );
}
