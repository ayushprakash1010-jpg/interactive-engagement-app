import React from 'react';
import { AISparkle } from './AIBadge.jsx';

/**
 * AI insight / summary card — distills open-text responses, Q&A themes, or
 * sentiment into a short readout. Iris-tinted with a sparkle header and an
 * optional list of bullet themes. `shimmer` shows the generating state.
 */
export function AISummaryCard({
  title = 'AI summary', body, themes = [], shimmer = false, footnote, style = {},
}) {
  if (shimmer) {
    return (
      <div style={cardStyle}>
        <Header title={title} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          {[100, 92, 78].map((w, i) => (
            <span key={i} style={{
              height: '0.75rem', width: `${w}%`, borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, var(--iris-100) 25%, var(--iris-50) 50%, var(--iris-100) 75%)',
              backgroundSize: '200% 100%', animation: 'pulse-shimmer 1.3s linear infinite',
            }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={cardStyle}>
      <Header title={title} />
      {body && (
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)',
        }}>{body}</p>
      )}
      {themes.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {themes.map((t, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: 'var(--ai)', marginTop: '0.5rem', flexShrink: 0 }} />
              <span>{typeof t === 'string' ? t : <><strong style={{ fontWeight: 'var(--weight-semibold)' }}>{t.label}</strong>{t.count != null && <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}> · {t.count}</span>}</>}</span>
            </li>
          ))}
        </ul>
      )}
      {footnote && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', color: 'var(--text-faint)', marginTop: '0.125rem' }}>{footnote}</p>
      )}
    </div>
  );
}

const cardStyle = {
  display: 'flex', flexDirection: 'column', gap: '0.75rem',
  padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)',
  background: 'var(--ai-subtle)', border: '1px solid var(--ai-border)',
};

function Header({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ color: 'var(--ai)', display: 'inline-flex' }}><AISparkle size={16} /></span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--ai-subtle-text)' }}>{title}</span>
    </div>
  );
}
