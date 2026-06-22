import React from 'react';

const MEDALS = { 1: '#d19900', 2: '#9a9488', 3: '#b87333' };

/** One quiz leaderboard row: rank, avatar, name, points. Top 3 get a medal tint. */
export function LeaderboardRow({ rank = 1, name = 'Anonymous', points = 0, you = false, inverse = false, style = {} }) {
  const medal = MEDALS[rank];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
      background: you ? 'var(--brand-subtle)' : (inverse ? 'var(--surface-raised)' : 'var(--surface-offset)'),
      border: you ? '1px solid var(--teal-300)' : '1px solid transparent',
      ...style,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '1.75rem', height: '1.75rem', flexShrink: 0, borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)',
        fontVariantNumeric: 'tabular-nums',
        background: medal ? medal : 'transparent',
        color: medal ? 'var(--white)' : 'var(--text-muted)',
      }}>{rank}</span>
      <span style={{
        flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)',
        fontWeight: you ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{name}{you && <span style={{ color: 'var(--brand)', fontWeight: 'var(--weight-regular)' }}> · you</span>}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)',
        fontWeight: 'var(--weight-bold)', fontVariantNumeric: 'tabular-nums',
        color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
      }}>{points.toLocaleString()}<span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 'var(--weight-regular)' }}> pts</span></span>
    </div>
  );
}
