import React from 'react';

/**
 * Audience Q&A card: question text, author, upvote pill, and host moderation
 * state. Used in participant feed, host moderation queue, and projector.
 */
export function QuestionCard({
  text, author = 'Anonymous', votes = 0, voted = false, onUpvote,
  status, answered = false, inverse = false, style = {},
}) {
  return (
    <div style={{
      display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
      padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
      background: inverse ? 'var(--surface-raised)' : 'var(--surface-card)',
      border: `1px solid ${answered ? 'var(--success)' : 'var(--border-subtle)'}`,
      opacity: answered ? 0.85 : 1, ...style,
    }}>
      <button type="button" onClick={onUpvote} aria-pressed={voted} aria-label="Upvote"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem',
          minWidth: '2.75rem', padding: '0.375rem 0', flexShrink: 0,
          borderRadius: 'var(--radius-sm)', cursor: onUpvote ? 'pointer' : 'default',
          background: voted ? 'var(--brand-subtle)' : 'var(--surface-offset)',
          border: `1px solid ${voted ? 'var(--teal-300)' : 'var(--border-subtle)'}`,
          color: voted ? 'var(--brand)' : 'var(--text-muted)',
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{votes}</span>
      </button>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)',
          fontWeight: 'var(--weight-medium)', lineHeight: 'var(--leading-snug)',
          color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
        }}>{text}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <span>{author}</span>
          {answered && (<><span>·</span><span style={{ color: 'var(--success)', fontWeight: 'var(--weight-semibold)' }}>Answered</span></>)}
          {status === 'pending' && (<><span>·</span><span style={{ color: 'var(--warning)', fontWeight: 'var(--weight-semibold)' }}>Pending review</span></>)}
        </div>
      </div>
    </div>
  );
}
