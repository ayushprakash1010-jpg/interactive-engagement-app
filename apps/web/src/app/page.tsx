import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  Cloud,
  LineChart,
  MessagesSquare,
  QrCode,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

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
    body: 'Audiences ask and upvote questions. Moderate, approve, and mark answered from one queue.',
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
    body: 'Sign in and spin up an event in seconds. Build polls, quizzes, and more before you go live.',
  },
  {
    icon: QrCode,
    title: 'Share the code or QR',
    body: 'Participants join instantly from any device — no app, no account, no friction.',
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
      'CSV & PDF reports',
      'Custom branding',
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
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container mx-auto max-w-6xl px-4 py-24 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
              Real-time audience engagement
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Turn any audience into a conversation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Live polls, Q&amp;A, quizzes, word clouds, and feedback for
              meetings, webinars, and classrooms. Participants join with a code
              or QR — no app, no login.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={SIGNUP_HREF}>
                  Start here — it&apos;s free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. Email or Google sign-up.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to engage live
              </h2>
              <p className="mt-4 text-muted-foreground">
                One platform for every interactive moment — built for the big
                screen and every phone in the room.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <CardContent className="space-y-3 p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/30">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Live in three steps
              </h2>
              <p className="mt-4 text-muted-foreground">
                From idea to interactive in minutes.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <div className="mt-2 text-sm font-semibold text-primary">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start free. Upgrade when your audience grows.
              </p>
            </div>
            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted
                      ? 'relative border-primary shadow-lg lg:scale-105'
                      : 'relative'
                  }
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most popular
                    </span>
                  )}
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.blurb}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.cadence}
                      </span>
                    </div>
                    <Button
                      asChild
                      className="w-full"
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      <a href={plan.href}>{plan.cta}</a>
                    </Button>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
        <section className="border-t">
          <div className="container mx-auto max-w-4xl px-4 py-24">
            <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to make your next session interactive?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Create your first event in minutes. Your audience just needs a
                code.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <a href={SIGNUP_HREF}>
                    Start here
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
