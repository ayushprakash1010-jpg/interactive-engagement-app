import React from 'react';

const TONES = {
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)', dot: 'var(--ink-700)' },
  brand:   { bg: 'var(--brand-subtle)',  fg: 'var(--brand-subtle-text)', dot: 'var(--brand)' },
  success: { bg: 'var(--success-subtle)', fg: 'var(--green-600)', dot: 'var(--success)' },
  warning: { bg: 'var(--warning-subtle)', fg: '#8a6500', dot: 'var(--warning)' },
  error:   { bg: 'var(--error-subtle)',  fg: 'var(--red-600)', dot: 'var(--error)' },
  info:    { bg: 'var(--info-subtle)',   fg: 'var(--blue-500)', dot: 'var(--info)' },
  ai:      { bg: 'var(--ai-subtle)',     fg: 'var(--ai-subtle-text)', dot: 'var(--ai)' },
  live:    { bg: 'var(--success-subtle)', fg: 'var(--green-600)', dot: 'var(--live)' },
};

/** Compact status / category pill. `dot` adds a leading status dot; tone `live` animates it. */
export function Badge({ tone = 'neutral', dot = false, size = 'md', style = {}, children, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  const sz = size === 'sm'
    ? { padding: '0.0625rem 0.5rem', font: 'var(--text-2xs)' }
    : { padding: '0.1875rem 0.625rem', font: 'var(--text-xs)' };
  const isLive = tone === 'live';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: sz.padding, fontFamily: 'var(--font-sans)', fontSize: sz.font,
        fontWeight: 'var(--weight-semibold)', lineHeight: 1.4,
        letterSpacing: '0.01em', borderRadius: 'var(--radius-full)',
        background: t.bg, color: t.fg, whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {(dot || isLive) && (
        <span
          aria-hidden
          style={{
            width: '0.4375rem', height: '0.4375rem', borderRadius: '50%',
            background: t.dot, flexShrink: 0,
            animation: isLive ? 'pulse-live 1.6s var(--ease-standard) infinite' : 'none',
          }}
        />
      )}
      {children}
    </span>
  );
}
