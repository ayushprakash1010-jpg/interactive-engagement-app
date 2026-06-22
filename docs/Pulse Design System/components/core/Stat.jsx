import React from 'react';

/** Headline metric for dashboards & analytics. Big tabular number + label. */
export function Stat({ value, label, sub, icon = null, tone = 'default', style = {} }) {
  const accent = { default: 'var(--text-primary)', brand: 'var(--brand)', ai: 'var(--ai)' }[tone];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)', color: 'var(--text-muted)',
        }}>{label}</span>
        {icon && <span style={{ color: 'var(--text-faint)', display: 'inline-flex' }}>{icon}</span>}
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)', lineHeight: 1,
        letterSpacing: 'var(--tracking-tight)', color: accent,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      {sub && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{sub}</span>
      )}
    </div>
  );
}
