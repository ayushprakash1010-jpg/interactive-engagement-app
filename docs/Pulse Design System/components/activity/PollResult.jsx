import React from 'react';

const DATA = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)', 'var(--data-6)', 'var(--data-7)', 'var(--data-8)'];

/**
 * A single horizontal poll-result bar with label, growing fill, count and %.
 * Compose several to make a live results chart. `index` picks the bar color
 * from the Pulse categorical data palette.
 */
export function PollResult({
  label, count = 0, total = 0, index = 0,
  leading = false, inverse = false, style = {},
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = DATA[index % DATA.length];
  const track = inverse ? 'rgba(255,255,255,0.08)' : 'var(--surface-offset)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
          fontWeight: leading ? 'var(--weight-semibold)' : 'var(--weight-medium)',
          color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
        }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)', fontVariantNumeric: 'tabular-nums',
          color: inverse ? 'var(--text-on-dark)' : 'var(--text-secondary)',
        }}>{pct}% <span style={{ color: inverse ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)', fontWeight: 'var(--weight-regular)' }}>· {count}</span></span>
      </div>
      <div style={{ position: 'relative', height: '0.625rem', borderRadius: 'var(--radius-full)', background: track, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', insetBlock: 0, left: 0, width: `${pct}%`,
          borderRadius: 'var(--radius-full)', background: color, transformOrigin: 'left',
          transition: 'width var(--dur-slow) var(--ease-out)',
          boxShadow: leading ? '0 0 0 2px color-mix(in srgb, ' + color + ' 30%, transparent)' : 'none',
        }} />
      </div>
    </div>
  );
}
