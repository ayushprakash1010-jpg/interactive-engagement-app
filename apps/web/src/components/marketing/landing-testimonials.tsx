'use client';

import { Star } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Eyebrow } from '@/components/pulse';
import { GlowCard, ScrollReveal, StaggerContainer } from './landing-animations';

/* ─── Data ─────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      "Pulse's AI-driven insights have transformed how we handle board meetings and global all-hands. The instant theme clustering of open Q&A saves our leadership team hours of manual review.",
    name: 'Dr. Shiv Kumar',
    role: 'Managing Director',
    company: 'VIP',
    initials: 'SK',
    gradient: 'from-teal-500 to-emerald-600',
    stars: 5,
  },
  {
    quote:
      "As a strategist, capturing real-time audience sentiment is critical. Pulse makes it effortless to integrate interactive polls and surveys into our digital marketing workshops. The analytics export is brilliant.",
    name: 'Pooja Singh',
    role: 'Founder & AI Strategist',
    company: 'GrowYT',
    initials: 'PS',
    gradient: 'from-violet-500 to-purple-700',
    stars: 5,
  },
  {
    quote:
      "I regularly host technical deep-dives for engineering teams. The fact that participants can join instantly without creating accounts or dealing with auth friction is a massive win for our technical audiences.",
    name: 'Suman Saurav',
    role: 'Senior Software Engineer II',
    company: 'Rocket',
    initials: 'SS',
    gradient: 'from-orange-500 to-rose-600',
    stars: 5,
  },
];

/* ─── Component ─────────────────────────────────────────────── */
export function LandingTestimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 border-b border-border bg-surface-canvas"
    >
      <div className="mx-auto max-w-container-xl px-6 py-24">
        {/* Header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Loved by hosts everywhere</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Real sessions. Real results.
            </h2>
            <p className="mt-4 text-ink-muted">
              From university lecture halls to Fortune 500 all-hands — Pulse keeps every room engaged.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <StaggerContainer
          staggerMs={110}
          baseDelay={100}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <GlowCard
              key={t.name}
              className="testimonial-quote-bg group relative h-full rounded-xl border border-border bg-surface-card shadow-xs transition duration-base hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <CardContent className="flex h-full flex-col p-7">
                {/* Stars */}
                <div className="flex items-center gap-0.5" aria-label={`${t.stars} out of 5 stars`}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-5 flex-1 text-sm leading-7 text-ink-primary">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white shadow-sm`}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-ink-muted">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlowCard>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
