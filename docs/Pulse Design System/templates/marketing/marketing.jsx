/* Pulse — Marketing landing UI kit. Recreated from apps/web/src/app/page.tsx, restyled + AI angle. */
const { Button, Card, Badge, AIBadge, AISparkle, JoinCode } = window.PulseDesignSystem_424f5e;

const Ic = ({ n, s = 20, c = 'currentColor' }) => {
  const d = window.lucide?.icons?.[n];
  return d ? <span style={{ display: 'inline-flex', color: c }} dangerouslySetInnerHTML={{ __html: d.toSvg({ width: s, height: s }) }} /> : null;
};

const FEATURES = [
  ['bar-chart-3', 'Live polls', 'Single, multiple, rating, and open text. Results animate in as votes land.'],
  ['messages-square', 'Anonymous Q&A', 'Audiences ask and upvote. Moderate and mark answered from one queue.'],
  ['trophy', 'Interactive quizzes', 'Timed questions, points, and a live leaderboard that keeps the room competitive.'],
  ['cloud', 'Word clouds', 'Collect words on any prompt and watch a weighted cloud grow on the big screen.'],
  ['star', 'Feedback forms', 'Rating and open-text feedback, captured live and exportable.'],
  ['line-chart', 'Analytics & reports', 'Participation, engagement timelines, per-activity breakdowns. CSV & PDF.'],
];
const STATS = [['<1s', 'Broadcast latency'], ['5,000+', 'Live participants / event'], ['No login', 'For participants'], ['CSV / PDF', 'Session reports']];
const STEPS = [['zap', 'Create or generate', 'Build activities by hand — or describe your session and let Pulse AI draft them.'], ['qr-code', 'Share the code', 'Participants join instantly from any device. No app, no account.'], ['users', 'Engage live', 'Launch activities and watch responses sync to the room in under a second.']];

function Nav() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'color-mix(in srgb, var(--surface-canvas) 80%, transparent)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="../../assets/pulse-wordmark.svg" width="120" alt="Pulse" />
        <nav style={{ display: 'flex', gap: 30 }}>
          {['Features', 'How it works', 'Pricing'].map((l) => <a key={l} href="#" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>)}
        </nav>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" size="md">Log in</Button>
          <Button variant="primary" size="md">Start free</Button>
        </div>
      </div>
    </header>
  );
}

function Section({ children, style }) {
  return <section style={{ maxWidth: 1120, margin: '0 auto', padding: '88px 24px', ...style }}>{children}</section>;
}

function MarketingApp() {
  return (
    <div data-screen-label="Marketing" style={{ background: 'var(--surface-canvas)' }}>
      <Nav />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, var(--teal-50) 0%, var(--surface-canvas) 60%)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Section style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 88 }}>
          <div style={{ display: 'inline-flex', marginBottom: 22 }}><Badge tone="ai" size="md"><AISparkle size={13} /> &nbsp;Now with Pulse AI</Badge></div>
          <h1 style={{ fontSize: 'var(--text-5xl)', maxWidth: 760, margin: '0 auto', lineHeight: 1.05 }}>Turn any audience into a conversation</h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', maxWidth: 560, margin: '22px auto 0', lineHeight: 1.55 }}>
            Live polls, Q&amp;A, quizzes, and word clouds for meetings, webinars, and classrooms. Describe your session — Pulse AI drafts it. Participants join with a code. No app, no login.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 30 }}>
            <Button variant="primary" size="xl" iconRight={<Ic n="arrow-right" s={18} />}>Start free</Button>
            <Button variant="secondary" size="xl">Watch a demo</Button>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginTop: 16 }}>No credit card required · Email or Google sign-up</p>
        </Section>
      </div>

      {/* Stats */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {STATS.map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{v}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI band */}
      <Section>
        <Card tone="ai" padding="lg" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center', borderRadius: 'var(--radius-2xl)' }}>
          <div>
            <AIBadge label="Pulse AI" gradient />
            <h2 style={{ fontSize: 'var(--text-3xl)', margin: '16px 0 12px' }}>Describe it. Pulse drafts it.</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              Type “sprint retro for 12 people” and get a runnable agenda — polls, a word cloud, and Q&amp;A — in seconds. After the session, AI summarizes every open response and clusters your Q&amp;A into themes.
            </p>
            <Button variant="ai" size="lg" iconLeft={<AISparkle size={16} />}>Try the AI builder</Button>
          </div>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--ai-border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
            <div style={{ display: 'flex', gap: 10, color: 'var(--ai)', fontSize: 'var(--text-sm)', fontWeight: 500, alignItems: 'flex-start' }}>
              <AISparkle size={18} />
              <span style={{ color: 'var(--text-primary)' }}>Kick off our Q3 all-hands — warm up the room, take the pulse on morale, then open Q&amp;A.</span>
            </div>
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['bar-chart-3', 'Poll · How are you feeling about Q3?'], ['cloud', 'Word cloud · One word for our biggest win'], ['messages-square', 'Q&A · Open questions for leadership']].map(([ic, t]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: 'var(--ai-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--ai)' }}><Ic n={ic} s={16} /></span>{t}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      {/* Features */}
      <Section style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)' }}>Everything you need to engage live</h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginTop: 12 }}>One platform for every interactive moment — built for the big screen and every phone in the room.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {FEATURES.map(([icon, title, body]) => (
            <Card key={title} padding="md">
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--brand-subtle)', color: 'var(--brand)' }}><Ic n={icon} s={20} /></span>
              <h3 style={{ fontSize: 'var(--text-lg)', margin: '14px 0 6px' }}>{title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.55 }}>{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <div style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'var(--text-3xl)' }}>Live in three steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {STEPS.map(([icon, title, body], i) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'var(--brand)', color: '#fff' }}><Ic n={icon} s={22} /></span>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--brand)', marginTop: 12, letterSpacing: '.04em' }}>STEP {i + 1}</div>
                <h3 style={{ fontSize: 'var(--text-lg)', margin: '6px 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: 260, margin: '0 auto', lineHeight: 1.55 }}>{body}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <Section>
        <div style={{ background: 'var(--teal-900)', borderRadius: 'var(--radius-2xl)', padding: '72px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-on-dark)' }}>Ready to make your next session interactive?</h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--teal-300)', maxWidth: 520, margin: '16px auto 0' }}>Create your first event in minutes. Your audience just needs a code.</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 32 }}>
            <Button variant="primary" size="xl" iconRight={<Ic n="arrow-right" s={18} />}>Start free</Button>
            <JoinCode code="QZ7K2P" size="md" inverse />
          </div>
        </div>
      </Section>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 'var(--text-sm)' }}>
        <img src="../../assets/pulse-wordmark.svg" width="92" alt="Pulse" style={{ opacity: 0.6, marginBottom: 10 }} /><br />
        © 2026 Pulse · Real-time audience engagement
      </footer>
    </div>
  );
}

window.MarketingApp = MarketingApp;
