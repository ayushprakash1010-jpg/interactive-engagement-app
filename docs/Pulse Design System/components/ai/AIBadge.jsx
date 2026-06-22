import React from 'react';

/** Sparkles glyph used across AI surfaces (inline, no dependency). */
export function AISparkle({ size = 16, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>
    </svg>
  );
}

/** Small "AI" / "AI generated" pill. `gradient` uses the iris→teal AI gradient. */
export function AIBadge({ label = 'AI', gradient = false, size = 'md', style = {} }) {
  const sz = size === 'sm'
    ? { padding: '0.0625rem 0.5rem', font: 'var(--text-2xs)', icon: 11 }
    : { padding: '0.1875rem 0.625rem', font: 'var(--text-xs)', icon: 13 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
      padding: sz.padding, fontFamily: 'var(--font-sans)', fontSize: sz.font,
      fontWeight: 'var(--weight-semibold)', lineHeight: 1.4, letterSpacing: '0.02em',
      borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
      background: gradient ? 'var(--ai-gradient)' : 'var(--ai-subtle)',
      color: gradient ? 'var(--white)' : 'var(--ai-subtle-text)',
      ...style,
    }}>
      <AISparkle size={sz.icon} />
      {label}
    </span>
  );
}
