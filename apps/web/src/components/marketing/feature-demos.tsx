'use client';

import { Star, Trophy, BarChart3 } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
 * Mini animated demos shown inside feature cards on hover.
 * Each component is self-contained and CSS-animation driven
 * (no timers, no JS intervals — pure group-hover Tailwind).
 * ────────────────────────────────────────────────────────────── */

/* Poll bars demo */
export function PollDemo() {
  const bars = [
    { label: 'Strongly agree', pct: 72, color: 'var(--brand)' },
    { label: 'Agree', pct: 48, color: 'var(--data-3)' },
    { label: 'Neutral', pct: 18, color: 'var(--data-5)' },
  ];
  return (
    <div className="space-y-2">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="mb-0.5 flex justify-between text-[10px] text-ink-muted">
            <span>{b.label}</span>
            <span>{b.pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out group-hover:w-[var(--bar-w)]"
              style={
                {
                  '--bar-w': `${b.pct}%`,
                  width: 0,
                  background: b.color,
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Q&A bubbles demo */
export function QADemo() {
  const questions = [
    "What\u2019s next on the roadmap?",
    'Can we get more details on pricing?',
  ];
  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div
          key={q}
          className="rounded-md bg-surface-raised px-3 py-2 text-[10px] leading-4 text-ink-muted opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0"
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          <span className="mr-1.5 rounded-full bg-brand-subtle px-1.5 py-0.5 text-[9px] font-bold text-brand">
            ↑ {12 - i * 5}
          </span>
          {q}
        </div>
      ))}
    </div>
  );
}

/* Quiz leaderboard demo */
export function QuizDemo() {
  const rows = [
    { name: 'Priya S.', pts: 980, medal: '🥇' },
    { name: 'Rahul V.', pts: 860, medal: '🥈' },
    { name: 'Anika M.', pts: 740, medal: '🥉' },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div
          key={r.name}
          className="flex items-center justify-between rounded-md bg-surface-raised px-3 py-1.5 text-[10px] opacity-0 translate-x-3 transition-all duration-400 group-hover:opacity-100 group-hover:translate-x-0"
          style={{ transitionDelay: `${i * 70}ms` }}
        >
          <span>{r.medal} {r.name}</span>
          <span className="font-mono font-bold">{r.pts}</span>
        </div>
      ))}
    </div>
  );
}

/* Word cloud demo */
export function WordCloudDemo() {
  const words = [
    { text: 'Engaging', size: 'text-sm font-bold', color: 'text-brand' },
    { text: 'Fun', size: 'text-xs', color: 'text-data-3' },
    { text: 'Interactive', size: 'text-[10px] font-semibold', color: 'text-ai' },
    { text: 'Live', size: 'text-sm', color: 'text-data-4' },
    { text: 'Clear', size: 'text-xs', color: 'text-ink-muted' },
    { text: 'Fast', size: 'text-[11px] font-bold', color: 'text-brand' },
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 leading-none">
      {words.map((w, i) => (
        <span
          key={w.text}
          className={`${w.size} ${w.color} opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100`}
          style={{ transitionDelay: `${i * 55}ms` }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}

/* Feedback stars demo */
export function FeedbackDemo() {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-warning text-warning opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
      <div className="text-[10px] text-ink-muted opacity-0 translate-y-1 transition-all duration-400 delay-300 group-hover:opacity-100 group-hover:translate-y-0">
        &ldquo;Loved the live format — would attend again!&rdquo;
      </div>
    </div>
  );
}

/* Survey progress demo */
export function SurveyDemo() {
  const steps = ['Registration', 'Feedback', 'NPS'];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'var(--brand)',
                transitionDelay: `${i * 100}ms`,
                opacity: 0,
                animation: undefined,
              }}
            >
              <span
                className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                ✓
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px flex-1 bg-border">
                <div
                  className="h-full bg-brand transition-all duration-500 group-hover:w-full"
                  style={{ width: 0, transitionDelay: `${(i + 1) * 100}ms` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-ink-muted">
        {steps.map((s, i) => (
          <span
            key={s}
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ transitionDelay: `${i * 100}ms`, marginRight: i < steps.length - 1 ? '1.5rem' : 0 }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Analytics sparkline demo */
export function AnalyticsDemo() {
  // A simple SVG polyline sparkline
  const points = '0,28 10,22 20,24 30,14 40,16 50,8 60,10 70,4 80,6';
  return (
    <div>
      <svg
        viewBox="0 0 80 32"
        className="h-8 w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="url(#spark-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: 200,
          }}
        />
        {/* JS-free trick: CSS group-hover via Tailwind won't work on SVG stroke-dashoffset,
            so we use the group class on the parent and a CSS variable + keyframe instead.
            We apply a class that the group-hover triggers. */}
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-ink-muted">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
      </div>
    </div>
  );
}

/* AI Agenda Builder demo */
export function AIAgendaDemo() {
  const items = [
    'Opening poll — team energy check',
    'Live Q&A — product roadmap',
    'Closing word cloud — one word',
  ];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-fuchsia-400">AI drafting…</span>
      </div>
      {items.map((item, i) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-md bg-surface-raised px-2.5 py-1.5 text-[10px] opacity-0 translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0"
          style={{ transitionDelay: `${i * 90}ms` }}
        >
          <span className="text-fuchsia-400">✦</span>
          <span className="text-ink-muted">{item}</span>
        </div>
      ))}
    </div>
  );
}

/* QR Code Join demo */
export function QRJoinDemo() {
  // 5×5 pixel QR pattern (decorative, not scannable)
  const cells = [
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,1,0,1,
    1,0,0,0,1,
    1,1,1,1,1,
  ];
  return (
    <div className="flex items-center gap-4">
      {/* Mini QR grid */}
      <div className="grid grid-cols-5 gap-0.5 opacity-0 scale-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-[2px] transition-all duration-300 ${c ? 'bg-cyan-400' : 'bg-surface-raised'}`}
            style={{ transitionDelay: `${i * 15}ms` }}
          />
        ))}
      </div>
      {/* Join code */}
      <div className="opacity-0 translate-x-2 transition-all duration-500 delay-200 group-hover:opacity-100 group-hover:translate-x-0">
        <div className="text-[9px] font-medium text-ink-muted mb-1">Join code</div>
        <div className="font-mono text-base font-bold tracking-[0.25em] text-cyan-400">QZ7K2P</div>
        <div className="text-[9px] text-ink-muted mt-0.5">No app · No account</div>
      </div>
    </div>
  );
}

