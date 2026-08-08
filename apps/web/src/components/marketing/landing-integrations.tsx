'use client';

import { Eyebrow } from '@/components/pulse';
import {
  ZoomIcon,
  GoogleMeetIcon,
  TeamsIcon,
  PowerPointIcon,
  GoogleSlidesIcon,
} from '@/components/brand-icons';
import { ScrollReveal, StaggerContainer } from './landing-animations';

/* ─── Data ─────────────────────────────────────────────────── */
const INTEGRATIONS = [
  {
    Icon: ZoomIcon,
    name: 'Zoom',
    description: 'Run Pulse inside your Zoom meeting',
  },
  {
    Icon: GoogleMeetIcon,
    name: 'Google Meet',
    description: 'Engage attendees without leaving Meet',
  },
  {
    Icon: TeamsIcon,
    name: 'Microsoft Teams',
    description: 'Launch polls & Q&A from Teams',
  },
  {
    Icon: PowerPointIcon,
    name: 'PowerPoint',
    description: 'Embed live activities in any slide deck',
  },
  {
    Icon: GoogleSlidesIcon,
    name: 'Google Slides',
    description: 'Present and poll simultaneously',
  },
];

/* ─── Component ─────────────────────────────────────────────── */
export function LandingIntegrations() {
  return (
    <section
      id="integrations"
      className="scroll-mt-20 border-y border-border bg-surface-raised"
    >
      <div className="mx-auto max-w-container-xl px-6 py-24">
        {/* Header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mb-3">Works with your existing tools</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Drop Pulse into any workflow
            </h2>
            <p className="mt-4 text-ink-muted">
              No app switching. Pulse plugs directly into the tools your team already uses — meetings,
              slides, and all.
            </p>
          </div>
        </ScrollReveal>

        {/* Integration cards */}
        <StaggerContainer
          staggerMs={80}
          baseDelay={80}
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
        >
          {INTEGRATIONS.map(({ Icon, name, description }) => (
            <div
              key={name}
              className="integration-card flex w-44 flex-col items-center gap-3 rounded-2xl border border-border bg-surface-card/70 px-5 py-6 text-center shadow-xs"
              role="img"
              aria-label={name}
            >
              {/* Icon */}
              <div className="integration-icon flex h-14 w-14 items-center justify-center rounded-xl">
                <Icon className="h-12 w-12" />
              </div>

              {/* Name */}
              <span className="text-sm font-semibold leading-tight">{name}</span>

              {/* Description */}
              <span className="text-xs leading-5 text-ink-muted">{description}</span>
            </div>
          ))}
        </StaggerContainer>

        {/* Bottom note */}
        <ScrollReveal delay={200}>
          <p className="mt-10 text-center text-xs text-ink-muted">
            Participants join via code or QR — no app or account needed on their end.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
