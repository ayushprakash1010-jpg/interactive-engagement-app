'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Eyebrow } from '@/components/pulse';
import { ScrollReveal, StaggerContainer } from './landing-animations';

/* ─── Data ─────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'Do participants need to create an account?',
    a: 'No. Participants join with a 6-character code or QR scan — no app, no sign-up, no friction. Only the host needs a Pulse account.',
  },
  {
    q: 'How many people can join at once?',
    a: 'Up to 5,000 live participants per event on all paid plans. The Free plan supports up to 50 participants per month. Need more? Reach out to our sales team.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. Participants join from any device — phone, tablet, or laptop — directly in their browser. No app install required.',
  },
  {
    q: 'Can I try it before buying?',
    a: 'Absolutely. The Free plan includes up to 50 participants per month and 10 AI requests at no cost — no credit card required.',
  },
  {
    q: 'How does the AI feature work?',
    a: 'Pulse AI drafts your session agenda from a plain-text description, summarizes open-text responses, and clusters Q&A themes by topic. You review and approve everything — AI is a fast first draft you own, never autonomous.',
  },
  {
    q: 'Can I export my session data?',
    a: 'Yes. CSV and PDF exports are available on the Basic plan and above, covering all participant responses, poll results, and analytics breakdowns.',
  },
  {
    q: 'Does Pulse work with Zoom, Teams, and Google Meet?',
    a: 'Yes — Pulse has native integrations with Zoom, Microsoft Teams, and Google Meet, as well as PowerPoint and Google Slides. Participants join through Pulse while you stay in your meeting.',
  },
];

/* ─── Accordion item ────────────────────────────────────────── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const id = `faq-item-${index}`;

  return (
    <div className="border-b border-border last:border-0">
      <button
        id={`${id}-btn`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-150 hover:text-brand"
      >
        <span className="text-sm font-semibold leading-6 sm:text-base">{q}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>
      {/* Height-based expand — rendered always, height toggled via max-height */}
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        style={{
          maxHeight: open ? '320px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <p className="pb-5 text-sm leading-7 text-ink-muted">{a}</p>
      </div>
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────── */
export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 border-b border-border bg-surface-canvas">
      <div className="mx-auto max-w-container-xl px-6 py-24">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Got questions?</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-ink-muted">
              Everything you need to know before your first session. Can&apos;t find an answer?{' '}
              <a
                href="/support"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Ask our team
              </a>
              .
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="mx-auto mt-14 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-surface-card px-6 shadow-sm sm:px-8">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
