'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eyebrow } from '@/components/pulse';
import { ScrollReveal, StaggerContainer } from './landing-animations';

const SIGNUP_HREF = '/api/auth/signup?returnTo=/dashboard';

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    cadence: 'forever',
    blurb: 'For trying it out and small sessions.',
    features: [
      'Up to 50 participants / mo',
      '10 AI requests / mo',
      'Basic analytics',
      'Standard polling',
    ],
    cta: 'Start here',
    href: SIGNUP_HREF,
    highlighted: false,
  },
  {
    name: 'Basic',
    monthlyPrice: 499,
    cadence: 'per host / month',
    blurb: 'For individuals and small groups.',
    features: [
      'Unlimited participants',
      'Unlimited AI requests',
      'Basic analytics',
      'Data exports (CSV/PDF)',
    ],
    cta: 'Start free trial',
    href: SIGNUP_HREF,
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 999,
    cadence: 'per host / month',
    blurb: 'For regular hosts and growing teams.',
    features: [
      'Everything in Basic',
      'Q&A moderation',
      'Custom branding',
      'Advanced analytics',
    ],
    cta: 'Start free trial',
    href: SIGNUP_HREF,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    cadence: 'custom',
    blurb: 'For organizations with SSO and scale needs.',
    features: [
      'Everything in Pro',
      'Priority support',
      'SSO / SAML',
      'Org-level analytics',
      'SLA & onboarding',
    ],
    cta: 'Contact sales',
    href: '#',
    highlighted: false,
  },
] as const;

const ANNUAL_DISCOUNT = 0.8; // 20% off

function formatPrice(monthly: number, isAnnual: boolean): string {
  const price = isAnnual ? Math.round(monthly * ANNUAL_DISCOUNT) : monthly;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function LandingPricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-border bg-surface-raised">
      <div className="mx-auto max-w-container-xl px-6 py-24">
        {/* Header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Pricing</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-ink-muted">Start free. Upgrade when your audience grows.</p>

            {/* Monthly / Annual toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-surface-card p-1 shadow-xs">
              <button
                onClick={() => setIsAnnual(false)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  !isAnnual
                    ? 'bg-brand text-brand-foreground shadow-sm'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
                aria-pressed={!isAnnual}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isAnnual
                    ? 'bg-brand text-brand-foreground shadow-sm'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
                aria-pressed={isAnnual}
              >
                Annual
                {/* Save 20% badge */}
                <span className="absolute -right-2 -top-3 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Plan cards */}
        <StaggerContainer
          staggerMs={100}
          baseDelay={100}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch"
        >
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? 'pro-glow-card relative rounded-xl border-2 border-brand bg-surface-card shadow-xl h-full flex flex-col'
                  : 'relative rounded-xl border border-border bg-surface-card shadow-xs h-full flex flex-col transition duration-base hover:shadow-md hover:-translate-y-0.5'
              }
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground shadow-sm">
                  Most popular
                </span>
              )}
              <CardContent className="flex h-full flex-col p-6">
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-6 text-ink-muted">{plan.blurb}</p>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-2">
                  {plan.monthlyPrice === null ? (
                    <span className="font-display text-3xl font-bold tracking-tight">
                      Let&apos;s talk
                    </span>
                  ) : plan.monthlyPrice === 0 ? (
                    <span className="font-display text-4xl font-bold tracking-tight">₹0</span>
                  ) : (
                    <span
                      className="font-display text-4xl font-bold tracking-tight tabular-nums transition-all duration-300"
                      key={`${plan.name}-${isAnnual}`}
                      style={{ animation: 'price-flip 250ms cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                      {formatPrice(plan.monthlyPrice, isAnnual)}
                    </span>
                  )}
                  <span className="text-sm text-ink-muted">
                    {plan.monthlyPrice !== null && plan.monthlyPrice !== 0
                      ? isAnnual
                        ? 'per host / month, billed annually'
                        : plan.cadence
                      : plan.cadence}
                  </span>
                </div>

                {/* Savings callout for annual */}
                {isAnnual && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                  <p className="mt-1 text-xs font-medium text-success">
                    Save ₹{Math.round(plan.monthlyPrice * 0.2 * 12).toLocaleString('en-IN')} / year
                  </p>
                )}

                <Button
                  asChild
                  className="mt-6 w-full"
                  size="lg"
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <a href={plan.href}>{plan.cta}</a>
                </Button>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
