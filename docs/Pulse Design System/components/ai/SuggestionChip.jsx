import React from 'react';
import { AISparkle } from './AIBadge.jsx';

/**
 * A single AI suggestion the host can accept — e.g. a drafted question,
 * a follow-up poll, or a moderation action. Iris-tinted with accept/dismiss.
 */
export function SuggestionChip({ text, onAccept, onDismiss, icon, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      padding: '0.5rem 0.5rem 0.5rem 0.875rem', borderRadius: 'var(--radius-full)',
      background: 'var(--surface-card)', border: '1px solid var(--ai-border)',
      ...style,
    }}>
      <span style={{ color: 'var(--ai)', display: 'inline-flex', flexShrink: 0 }}>{icon || <AISparkle size={15} />}</span>
      <span style={{
        flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
        color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)',
      }}>{text}</span>
      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
        {onDismiss && (
          <button type="button" onClick={onDismiss} aria-label="Dismiss"
            style={iconBtn('transparent', 'var(--text-faint)')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
        {onAccept && (
          <button type="button" onClick={onAccept} aria-label="Accept"
            style={iconBtn('var(--ai)', 'var(--white)')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

function iconBtn(bg, fg) {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '1.75rem', height: '1.75rem', borderRadius: '50%', border: 'none',
    background: bg, color: fg, cursor: 'pointer',
  };
}
