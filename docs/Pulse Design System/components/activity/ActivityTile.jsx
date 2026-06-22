import React from 'react';

/**
 * Activity-type tile for the builder ("Add a poll / quiz / word cloud…").
 * Pass a Lucide icon node. The five IEP activity types each get a tone.
 */
const TONES = {
  poll:     { fg: 'var(--data-1)', bg: 'color-mix(in srgb, var(--data-1) 12%, white)' },
  quiz:     { fg: 'var(--data-4)', bg: 'color-mix(in srgb, var(--data-4) 14%, white)' },
  wordcloud:{ fg: 'var(--data-7)', bg: 'color-mix(in srgb, var(--data-7) 12%, white)' },
  qa:       { fg: 'var(--data-6)', bg: 'color-mix(in srgb, var(--data-6) 12%, white)' },
  feedback: { fg: 'var(--data-3)', bg: 'color-mix(in srgb, var(--data-3) 14%, white)' },
  ai:       { fg: 'var(--ai)',     bg: 'var(--ai-subtle)' },
};

export function ActivityTile({ icon, title, description, type = 'poll', onClick, style = {} }) {
  const t = TONES[type] || TONES.poll;
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = t.fg; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem',
        textAlign: 'left', width: '100%', padding: 'var(--space-5)',
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
        ...style,
      }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)',
        background: t.bg, color: t.fg,
      }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{title}</span>
      {description && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--leading-snug)' }}>{description}</span>
      )}
    </button>
  );
}
