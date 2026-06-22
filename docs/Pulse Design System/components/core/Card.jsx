import React from 'react';

/**
 * Surface container. `interactive` adds hover lift (use for clickable cards
 * like dashboard event tiles). `ai` themes the border/tint for AI panels.
 */
export function Card({
  interactive = false,
  padding = 'md',
  tone = 'default',
  style = {},
  children,
  ...rest
}) {
  const pad = { none: 0, sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' }[padding];
  const tones = {
    default: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' },
    raised:  { background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' },
    ai:      { background: 'var(--ai-subtle)', border: '1px solid var(--ai-border)' },
    dashed:  { background: 'transparent', border: '1px dashed var(--border-strong)' },
  }[tone];

  return (
    <div
      onMouseEnter={interactive ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--teal-300)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={interactive ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      } : undefined}
      style={{
        background: tones.background,
        border: tones.border,
        borderRadius: 'var(--radius-lg)',
        padding: pad,
        boxShadow: tone === 'dashed' ? 'none' : 'var(--shadow-sm)',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
