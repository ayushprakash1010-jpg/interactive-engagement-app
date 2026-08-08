'use client';

import { useState } from 'react';
import {
  Monitor,
  GraduationCap,
  Building2,
  Mic2,
  CheckCircle2,
} from 'lucide-react';
import { Eyebrow } from '@/components/pulse';
import { ScrollReveal } from './landing-animations';

/* ─── Data ─────────────────────────────────────────────────── */
const USE_CASES = [
  {
    id: 'webinars',
    label: 'Webinars',
    Icon: Monitor,
    tagline: 'Turn passive viewers into active participants',
    description:
      'Run polls, Q&A, and feedback across audiences of any size — no downloads or sign-ups required on their end.',
    benefits: [
      'Live Q&A with upvoting — your best questions rise to the top automatically',
      'Real-time polls gauge sentiment and keep energy high mid-session',
      'Post-webinar feedback forms exported to CSV before the meeting ends',
    ],
    chips: ['Live polls', 'Anonymous Q&A', 'Feedback forms', 'Analytics'],
    accentFrom: '#14b8a6', // teal-500
    accentTo: '#10b981',   // emerald-500
    tabAccent: 'text-teal-400',
    chipBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    statLabel: 'avg. participation rate',
    statValue: '91%',
  },
  {
    id: 'classrooms',
    label: 'Classrooms',
    Icon: GraduationCap,
    tagline: 'Keep 300 students engaged, every lecture',
    description:
      'From timed quizzes to anonymous questions — every student participates, not just the confident ones.',
    benefits: [
      'Timed quizzes with a live leaderboard that sparks healthy competition',
      'Anonymous Q&A so shy students finally ask their questions',
      'Word clouds for brainstorming, concept checks, and icebreakers',
    ],
    chips: ['Interactive quizzes', 'Anonymous Q&A', 'Word clouds', 'Surveys'],
    accentFrom: '#8b5cf6', // violet-500
    accentTo: '#7c3aed',   // violet-600
    tabAccent: 'text-violet-400',
    chipBg: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    statLabel: 'boost in student participation',
    statValue: '4×',
  },
  {
    id: 'corporate',
    label: 'Corporate Events',
    Icon: Building2,
    tagline: 'Make every all-hands feel heard',
    description:
      "Give every employee a voice — whether they're in the room or dialling in from three time zones away.",
    benefits: [
      'Pulse checks measure team sentiment live during leadership updates',
      'Q&A moderation so executives get quality questions, not just softballs',
      'Full session analytics ready for the People team before the next day',
    ],
    chips: ['Live polls', 'Q&A moderation', 'Surveys', 'Analytics & reports'],
    accentFrom: '#f97316', // orange-500
    accentTo: '#f59e0b',   // amber-500
    tabAccent: 'text-orange-400',
    chipBg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    statLabel: 'reduction in unanswered questions',
    statValue: '73%',
  },
  {
    id: 'conferences',
    label: 'Conferences',
    Icon: Mic2,
    tagline: 'Scale engagement across keynotes and breakouts',
    description:
      'QR code joins for 2,000+ attendees. Per-session speaker feedback. Organizer-level analytics — all from one dashboard.',
    benefits: [
      'QR code entry — no app install, no account, no friction for any attendee',
      'Per-session speaker feedback collected automatically after each talk',
      'Organizer analytics with participation rates across all rooms',
    ],
    chips: ['QR code join', 'Feedback forms', 'Word clouds', 'Analytics'],
    accentFrom: '#ec4899', // pink-500
    accentTo: '#f43f5e',   // rose-500
    tabAccent: 'text-pink-400',
    chipBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    statLabel: 'attendees supported per event',
    statValue: '5,000+',
  },
] as const;

type UseCaseId = (typeof USE_CASES)[number]['id'];

/* ─── Component ─────────────────────────────────────────────── */
export function LandingUseCases() {
  const [activeId, setActiveId] = useState<UseCaseId>('webinars');
  const active = USE_CASES.find((u) => u.id === activeId)!;

  return (
    <section
      id="use-cases"
      className="scroll-mt-20 border-b border-border bg-surface-canvas"
    >
      <div className="mx-auto max-w-container-xl px-6 py-24">
        {/* Header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Built for every room</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pulse works wherever your audience is
            </h2>
            <p className="mt-4 text-ink-muted">
              Whether it&apos;s a 30-person webinar or a 2,000-person conference — the same tool,
              tuned for every context.
            </p>
          </div>
        </ScrollReveal>

        {/* Tab strip */}
        <ScrollReveal delay={80}>
          <div
            className="mt-12 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Use cases"
          >
            {USE_CASES.map(({ id, label, Icon }) => {
              const isActive = id === activeId;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${id}`}
                  id={`tab-${id}`}
                  onClick={() => setActiveId(id)}
                  className={`
                    inline-flex items-center gap-2 rounded-full border px-5 py-2.5
                    text-sm font-semibold transition-all duration-200
                    ${
                      isActive
                        ? 'border-brand/40 bg-brand-subtle text-brand-subtle-text shadow-sm'
                        : 'border-border bg-surface-card text-ink-muted hover:border-brand/20 hover:bg-surface-raised hover:text-ink-primary'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Content panel — cross-fades on tab switch */}
        <div
          key={activeId}
          id={`panel-${activeId}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeId}`}
          className="mt-10 animate-tab-fade"
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left: text */}
            <div>
              {/* Icon + tagline */}
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${active.accentFrom}, ${active.accentTo})`,
                  }}
                >
                  <active.Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {active.tagline}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {active.description}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <ul className="mt-8 space-y-4">
                {active.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-6">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Activity chips */}
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="text-xs font-medium text-ink-muted self-center mr-1">
                  Activities used:
                </span>
                {active.chips.map((chip) => (
                  <span
                    key={chip}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${active.chipBg}`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: stat card + visual */}
            <div className="flex flex-col gap-4">
              {/* Big stat */}
              <div
                className="relative overflow-hidden rounded-2xl border border-border bg-surface-card p-8 shadow-sm"
              >
                {/* Gradient glow in corner */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-20"
                  style={{
                    background: `radial-gradient(circle, ${active.accentFrom}, transparent)`,
                  }}
                />
                <div
                  className="font-display text-6xl font-extrabold tracking-tight"
                  style={{
                    background: `linear-gradient(135deg, ${active.accentFrom}, ${active.accentTo})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {active.statValue}
                </div>
                <p className="mt-2 text-sm font-medium text-ink-muted">
                  {active.statLabel}
                </p>
              </div>

              {/* Mini feature list card */}
              <div className="rounded-2xl border border-border bg-surface-raised p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  What&apos;s available for {active.label.toLowerCase()}
                </p>
                <ul className="space-y-2.5">
                  {active.chips.map((chip, i) => (
                    <li key={chip} className="flex items-center gap-3">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: i === 0 ? active.accentFrom : i === 1 ? active.accentTo : 'var(--surface-canvas)',
                          border: i >= 2 ? `2px solid ${active.accentFrom}` : 'none',
                          opacity: i >= 2 ? 0.6 : 1,
                        }}
                      />
                      <span className="text-sm">{chip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
