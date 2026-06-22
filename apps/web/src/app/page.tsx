import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  Cloud,
  LineChart,
  MessagesSquare,
  QrCode,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { AIShowcase } from '@/components/marketing/ai-showcase';
import { AIBadge, Eyebrow, LiveDot } from '@/components/pulse';

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
    body: 'Rating and open-text feedback captured during or after a session — structured and exportable.',
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
    body: 'Sign in and spin up an event in seconds — or let Pulse draft it. Build polls, quizzes, and more before you go live.',
  },
  {
    icon: QrCode,
    title: 'Share the code or QR',
    body: 'Your audience joins instantly from any device — no app, no account, no friction.',
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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/10 via-surface-canvas to-surface-canvas" />
          <div className="mx-auto max-w-container-xl px-6 py-24 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-3 py-1 text-xs font-medium text-ink-muted">
              <LiveDot sizeClass="h-1.5 w-1.5" />
              Real-time audience engagement
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Turn any audience into a conversation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted">
              Pulse runs live polls, Q&amp;A, quizzes, word clouds, and feedback for meetings,
              webinars, and classrooms. Your audience joins with a code or QR — no app, no login.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl">
                <a href={SIGNUP_HREF}>
                  Start here — it&apos;s free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/join">Join an event</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              No credit card required. Email or Google sign-up.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border bg-surface-raised">
          <div className="mx-auto grid max-w-container-xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-ink-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow className="mb-3">Everything in one place</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to engage live
              </h2>
              <p className="mt-4 text-ink-muted">
                One platform for every interactive moment — built for the big screen and every phone
                in the room.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="h-full rounded-xl">
                  <CardContent className="space-y-3 p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-subtle text-brand">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-ink-muted">{feature.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Studio */}
        <section id="ai" className="scroll-mt-20 border-y border-border bg-surface-raised">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-3 flex justify-center">
                <AIBadge label="AI Studio" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Describe your session, Pulse drafts it
              </h2>
              <p className="mt-4 text-ink-muted">
                Generate a runnable agenda in seconds, then let Pulse summarize open responses and
                cluster Q&amp;A themes live. AI is a fast first draft you own — never autonomous.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-4xl">
              <AIShowcase />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow className="mb-3">How it works</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Live in three steps</h2>
              <p className="mt-4 text-ink-muted">From idea to interactive in minutes.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <div className="mt-3 font-mono text-xs font-semibold uppercase tracking-wider text-brand">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 border-t border-border bg-surface-raised">
          <div className="mx-auto max-w-container-xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow className="mb-3">Pricing</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-ink-muted">Start free. Upgrade when your audience grows.</p>
            </div>
            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted
                      ? 'relative rounded-xl border-2 border-brand shadow-lg lg:scale-105'
                      : 'relative rounded-xl'
                  }
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                      Most popular
                    </span>
                  )}
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="text-sm text-ink-muted">{plan.blurb}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-ink-muted">{plan.cadence}</span>
                    </div>
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      <a href={plan.href}>{plan.cta}</a>
                    </Button>
                    <ul className="space-y-2">
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
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-6 py-24">
            <div className="relative overflow-hidden rounded-2xl bg-brand px-8 py-16 text-center text-brand-foreground">
              <div className="pointer-events-none absolute inset-0 -z-0 opacity-20 [background:var(--ai-gradient)]" />
              <div className="relative">
                <div className="mb-4 flex justify-center text-brand-foreground/90">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-brand-foreground sm:text-4xl">
                  Ready to make your next session interactive?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-brand-foreground/80">
                  Create your first event in minutes. Your audience just needs a code.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="xl" variant="secondary">
                    <a href={SIGNUP_HREF}>
                      Start here
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="xl"
                    variant="outline"
                    className="border-brand-foreground/30 bg-transparent text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
