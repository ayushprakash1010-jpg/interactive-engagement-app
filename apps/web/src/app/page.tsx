import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Cloud,
  Download,
  LineChart,
  MessagesSquare,
  Play,
  QrCode,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { AIShowcase } from '@/components/marketing/ai-showcase';
import { AIBadge, Eyebrow, JoinCode, LiveDot } from '@/components/pulse';
import {
  ScrollReveal,
  StaggerContainer,
  GlowCard,
  LivePollBars,
  HeroSequence,
  CursorParallax,
  FloatingShape,
} from '@/components/marketing/landing-animations';

const SIGNUP_HREF = '/api/auth/signup?returnTo=/dashboard';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Live polls',
    body: 'Single choice, multiple choice, rating scales, and open text. Results animate in real time as votes land.',
  },
  {
    icon: MessagesSquare,
    title: 'Anonymous Q&A',
    body: 'Your audience asks and upvotes questions. Moderate, approve, and mark answered from one queue.',
  },
  {
    icon: Trophy,
    title: 'Interactive quizzes',
    body: 'Timed questions, points, and a live leaderboard that keeps the room competitive and engaged.',
  },
  {
    icon: Cloud,
    title: 'Word clouds',
    body: 'Collect words on any prompt and watch a weighted cloud grow live on the big screen.',
  },
  {
    icon: Star,
    title: 'Feedback forms',
    body: 'Rating and open-text feedback captured during or after a session - structured and exportable.',
  },
  {
    icon: ClipboardList,
    title: 'Surveys',
    body: 'Multi-step questionnaires perfect for event registration, audience profiling, and comprehensive feedback.',
  },
  {
    icon: LineChart,
    title: 'Analytics & reports',
    body: 'Participation, engagement timelines, and per-activity breakdowns. Export to CSV and PDF.',
  },
];

const STEPS = [
  {
    icon: Zap,
    title: 'Create an event',
    body: 'Sign in and spin up an event in seconds - or let Pulse draft it. Build polls, quizzes, and more before you go live.',
  },
  {
    icon: QrCode,
    title: 'Share the code or QR',
    body: 'Your audience joins instantly from any device - no app, no account, no friction.',
  },
  {
    icon: Users,
    title: 'Engage live',
    body: 'Launch activities, take questions, and watch responses sync to the room in under a second.',
  },
];

const STATS = [
  { value: '<1s', label: 'Broadcast latency' },
  { value: '5,000+', label: 'Live participants per event' },
  { value: 'No login', label: 'For participants' },
  { value: 'CSV / PDF', label: 'Session reports' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'For trying it out and small sessions.',
    features: ['Up to 50 participants', 'Polls & Q&A', '1 active event', 'Basic analytics'],
    cta: 'Start here',
    href: SIGNUP_HREF,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    cadence: 'per host / month',
    blurb: 'For regular hosts and growing teams.',
    features: [
      'Up to 5,000 participants',
      'All activity types',
      'Quizzes & leaderboards',
      'AI Studio & answer summaries',
      'CSV & PDF reports',
    ],
    cta: 'Start free trial',
    href: SIGNUP_HREF,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: "Let's talk",
    cadence: 'custom',
    blurb: 'For organizations with SSO and scale needs.',
    features: [
      'Unlimited participants',
      'SSO / SAML',
      'Org-level analytics',
      'Priority support',
      'SLA & onboarding',
    ],
    cta: 'Contact sales',
    href: '#',
    highlighted: false,
  },
];

const SHOWCASE_ACTIVITIES = [
  { label: 'Pulse check', type: 'Poll', value: '84%', tone: 'bg-brand' },
  { label: 'Leadership Q&A', type: 'Questions', value: '37', tone: 'bg-ai' },
  { label: 'Product quiz', type: 'Quiz', value: '#1', tone: 'bg-data-3' },
  { label: 'Event feedback', type: 'Survey', value: '100%', tone: 'bg-data-4' },
];

function ProductPreview() {
  return (
    <CursorParallax strength={4} className="relative w-full">
      {/* Animated hero glow behind the mockup */}
      <div className="landing-hero-glow absolute -inset-x-6 top-0 -z-10 h-72" />
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface-card shadow-xl">
        {/* Browser chrome */}
        <div className="flex h-12 items-center justify-between border-b border-border bg-surface-raised px-4">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <div className="hidden rounded-sm border border-border bg-surface-card px-3 py-1 text-xs text-ink-muted sm:block">
            pulse.app/dashboard/events/all-hands
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <LiveDot sizeClass="h-1.5 w-1.5" />
            Live
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-border bg-surface-raised p-5 lg:block">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Workspace
            </div>
            <div className="mt-4 space-y-2">
              {['Events', 'Activities', 'Analytics', 'AI Studio'].map((item, index) => (
                <div
                  key={item}
                  className={
                    index === 0
                      ? 'rounded-md bg-brand-subtle px-3 py-2 text-sm font-semibold text-brand-subtle-text'
                      : 'rounded-md px-3 py-2 text-sm text-ink-muted'
                  }
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-4 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-ink-muted">
                    Live event
                  </span>
                  <span className="rounded-full bg-success-subtle px-2.5 py-1 text-xs font-semibold text-success">
                    328 joined
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Quarterly all-hands
                </h2>
                <p className="mt-2 max-w-xl text-sm text-ink-muted">
                  Polls, Q&A, quizzes, surveys, and feedback stay in one host view while the room joins
                  from any device.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-surface-card text-brand shadow-xs">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-ink-muted">Join code</div>
                  <JoinCode code="QZ7K2P" size="sm" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {SHOWCASE_ACTIVITIES.map((activity) => (
                <div
                  key={activity.label}
                  className="rounded-lg border border-border bg-surface-card p-4 shadow-xs transition duration-base hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-muted">{activity.type}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${activity.tone}`} />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{activity.label}</div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="font-display text-3xl font-bold tabular-nums">
                      {activity.value}
                    </span>
                    <span className="text-xs text-ink-muted">live now</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Live poll with animated bars */}
              <div className="rounded-lg border border-border bg-surface-raised p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Live poll</h3>
                  <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <LiveDot sizeClass="h-1.5 w-1.5" />
                    Responding
                  </span>
                </div>
                <p className="mb-4 mt-1 text-sm text-ink-muted">
                  How aligned is our strategy this quarter?
                </p>
                <LivePollBars />
              </div>

              <div className="rounded-lg border border-border bg-surface-raised p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Question queue</h3>
                  <MessagesSquare className="h-4 w-4 text-brand" />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    'What should teams focus on next?',
                    'Can we see adoption by region?',
                    'Will slides be shared after this?',
                  ].map((question, index) => (
                    <div key={question} className="rounded-md bg-surface-card p-3 text-sm shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <span>{question}</span>
                        <span className="shrink-0 rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-semibold text-brand-subtle-text">
                          {12 - index * 3}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CursorParallax>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas">
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-b border-border">
          {/* Drifting radial gradient background */}
          <div className="hero-gradient-drift absolute inset-0 -z-10" />
          <div className="absolute left-1/2 top-0 -z-10 h-px w-[min(760px,80vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

          {/* Floating decorative blobs */}
          <FloatingShape amplitude={7} periodMs={7000} phaseMs={0} className="pointer-events-none absolute -left-16 top-32 -z-10 h-56 w-56 rounded-full bg-brand/5 blur-3xl">
            <span />
          </FloatingShape>
          <FloatingShape amplitude={9} periodMs={9000} phaseMs={2500} className="pointer-events-none absolute -right-20 top-48 -z-10 h-72 w-72 rounded-full bg-ai/5 blur-3xl">
            <span />
          </FloatingShape>

          <div className="mx-auto max-w-container-xl px-6 pb-16 pt-6 sm:pt-10 lg:pb-24">
            <div className="grid gap-6 lg:gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left lg:pt-4">
                <HeroSequence stepMs={90} baseDelay={80}>
                  {/* Slot 0: Badge */}
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface-card/90 px-3 py-1.5 text-xs font-semibold text-brand-subtle-text shadow-xs">
                    <LiveDot sizeClass="h-1.5 w-1.5" />
                    Real-time audience engagement
                  </div>

                  {/* Slot 1: Headline */}
                  <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl">
                    <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                      Turn passive rooms into{' '}
                    </span>
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                      active conversations.
                    </span>
                  </h1>

                  {/* Slot 2: Description */}
                  <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-ink-muted sm:text-xl lg:mx-0">
                    Effortlessly run live polls, interactive Q&A, and real-time quizzes. No downloads or sign-ups required—your audience joins instantly.
                  </p>

                  {/* Slot 3: CTA buttons */}
                  <div>
                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:items-start lg:justify-start">
                      <Button asChild size="xl" className="shimmer-cta shadow-glow-brand hero-cta-primary">
                        <a href={SIGNUP_HREF}>
                          Start here - it&apos;s free
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild size="xl" variant="outline" className="hero-cta-secondary">
                        <Link href="/join">
                          <Play className="h-4 w-4" />
                          Join an event
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted lg:justify-start">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                        No credit card required
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                        No sign-ups for participants
                      </span>
                    </div>
                  </div>
                </HeroSequence>
              </div>

              {/* Right Column: Visual */}
              <div className="relative w-full lg:mt-0 flex justify-center lg:justify-start lg:block lg:h-[700px] min-h-[250px] sm:min-h-[350px]">
                 {/* Decorative glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] -z-10 rounded-full bg-brand/15 blur-[100px]" />
                 
                 {/* Container for centering the scaled visual */}
                 <ScrollReveal delay={300} className="w-full flex justify-center lg:block">
                   {/* Bounding box to prevent mobile overflow */}
                   <div className="relative w-[315px] sm:w-[450px] md:w-[540px] lg:w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-auto">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:left-0 lg:-translate-x-0 w-[900px] origin-top scale-[0.35] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.65] xl:scale-[0.70] lg:origin-top-left">
                       <div className="transform perspective-[2500px] hover:rotate-0 transition-transform duration-700 ease-out lg:-rotate-y-12 lg:rotate-x-8 shadow-2xl rounded-xl">
                         <ProductPreview />
                       </div>
                     </div>
                   </div>
                 </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ───────────────────────────────────────────── */}
        <section className="border-b border-border bg-surface-card">
          <div className="mx-auto grid max-w-container-xl grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <ScrollReveal key={stat.label}>
                <div className="rounded-lg border border-border bg-surface-raised p-5 shadow-xs transition duration-base hover:-translate-y-0.5 hover:bg-surface-card hover:shadow-md">
                  <div className="font-display text-3xl font-bold tracking-tight tabular-nums">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink-muted">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <ScrollReveal>
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                  <Eyebrow className="mb-3">Everything in one place</Eyebrow>
                  <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                    Every interaction your session needs, in one polished workflow
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-7 text-ink-muted lg:justify-self-end">
                  One platform for every interactive moment - built for the big screen, the host
                  desk, and every phone in the room.
                </p>
              </div>
            </ScrollReveal>

            {/* Stagger reveal for the feature cards */}
            <StaggerContainer
              staggerMs={90}
              baseDelay={100}
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {FEATURES.map((feature) => (
                <GlowCard
                  key={feature.title}
                  className="group h-full rounded-lg border border-border bg-surface-card shadow-xs transition duration-base hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-subtle text-brand transition duration-base group-hover:bg-brand group-hover:text-brand-foreground">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{feature.body}</p>
                  </CardContent>
                </GlowCard>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── AI Studio ───────────────────────────────────────────── */}
        <section id="ai" className="scroll-mt-20 border-y border-border bg-surface-raised">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <ScrollReveal>
              <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
                <div>
                  <AIBadge label="AI Studio" />
                  <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                    Describe your session. Pulse drafts the first version.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-ink-muted">
                    Generate a runnable agenda in seconds, then let Pulse summarize open responses
                    and cluster Q&A themes live. AI is a fast first draft you own - never autonomous.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Agenda drafts', 'Answer summaries', 'Theme clustering'].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-ai-border bg-ai-subtle px-3 py-1 text-xs font-semibold text-ai-subtle-text"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-ai-border bg-surface-card p-3 shadow-glow-ai">
                  <AIShowcase />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <Eyebrow className="mb-3">How it works</Eyebrow>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Live in three steps</h2>
                <p className="mt-4 text-ink-muted">From idea to interactive in minutes.</p>
              </div>
            </ScrollReveal>

            <div className="relative mt-16">
              {/* Animated connector line */}
              <div className="step-connector-glow absolute left-[16.5%] right-[16.5%] top-8 hidden h-px md:block z-10" />

              <StaggerContainer
                staggerMs={120}
                baseDelay={200}
                className="grid gap-5 md:grid-cols-3 relative z-20"
              >
                {STEPS.map((step, i) => (
                  <div
                    key={step.title}
                    className="relative rounded-lg border border-border bg-surface-card p-6 shadow-xs transition duration-base hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow-brand">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <div className="mt-5 font-mono text-xs font-semibold uppercase tracking-wider text-brand">
                      Step {i + 1}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
                  </div>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────── */}
        <section id="pricing" className="scroll-mt-20 border-t border-border bg-surface-raised">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <Eyebrow className="mb-3">Pricing</Eyebrow>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Simple, transparent pricing
                </h2>
                <p className="mt-4 text-ink-muted">Start free. Upgrade when your audience grows.</p>
              </div>
            </ScrollReveal>

            <StaggerContainer
              staggerMs={100}
              baseDelay={100}
              className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch"
            >
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted
                      ? 'relative rounded-lg border-2 border-brand bg-surface-card shadow-xl'
                      : 'relative rounded-lg border-border bg-surface-card shadow-xs'
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
                      <p className="mt-2 min-h-10 text-sm leading-6 text-ink-muted">
                        {plan.blurb}
                      </p>
                    </div>
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="font-display text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-ink-muted">{plan.cadence}</span>
                    </div>
                    <Button
                      asChild
                      className="mt-6 w-full"
                      size="lg"
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      <a href={plan.href}>{plan.cta}</a>
                    </Button>
                    <ul className="mt-6 space-y-3">
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

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <ScrollReveal>
              <div className="pulse-stage relative isolate overflow-hidden rounded-xl border border-border px-6 py-16 text-center shadow-xl sm:px-10">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(122,57,187,0.28),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(79,152,163,0.34),transparent_30%)]" />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-card text-brand shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
                  Ready to make your next session interactive?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink-muted">
                  Create your first event in minutes. Your audience just needs a code.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="xl" className="shimmer-cta">
                    <a href={SIGNUP_HREF}>
                      Start here
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="xl"
                    variant="outline"
                    className="border-border bg-transparent text-ink-primary hover:bg-surface-card/10 hover:text-ink-primary"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Code or QR join
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    CSV and PDF reports
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
