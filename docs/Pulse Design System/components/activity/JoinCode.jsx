import React from 'react';

/**
 * Large mono join code, optionally with a copy affordance.
 * Mirrors the IEP projector treatment: tabular mono, wide tracking.
 */
export function JoinCode({ code = 'ABC123', size = 'md', onCopy, inverse = false, style = {} }) {
  const fs = { sm: 'var(--text-xl)', md: 'var(--text-3xl)', lg: 'var(--text-5xl)', xl: 'var(--text-7xl)' }[size];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', ...style }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-bold)',
        fontSize: fs, letterSpacing: 'var(--tracking-code)',
        color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>{code}</span>
      {onCopy && (
        <button type="button" onClick={() => onCopy(code)} aria-label="Copy code" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-offset)', border: '1px solid var(--border-default)',
          color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      )}
    </div>
  );
}
