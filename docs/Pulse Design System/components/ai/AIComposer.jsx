import React from 'react';
import { AISparkle } from './AIBadge.jsx';

/**
 * AI prompt composer — the entry point for "describe it, Pulse drafts it."
 * A rounded iris-tinted field with a sparkle, optional suggestion chips,
 * and a generate button. Controlled via `value` + `onChange` + `onGenerate`.
 */
export function AIComposer({
  value = '', onChange, onGenerate, placeholder = 'Describe your session — Pulse drafts the activities…',
  suggestions = [], loading = false, style = {},
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
      background: 'var(--ai-subtle)', border: '1px solid var(--ai-border)',
      ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
        padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-md)',
        background: 'var(--surface-card)', border: '1px solid var(--ai-border)',
      }}>
        <span style={{ color: 'var(--ai)', marginTop: '0.125rem', flexShrink: 0 }}><AISparkle size={18} /></span>
        <textarea
          rows={2} value={value} placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-normal)', color: 'var(--text-primary)',
          }}
        />
      </div>

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button" onClick={() => onChange && onChange(s)}
              style={{
                padding: '0.3125rem 0.75rem', borderRadius: 'var(--radius-full)',
                background: 'var(--surface-card)', border: '1px dashed var(--ai-border)',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)', color: 'var(--ai-subtle-text)', cursor: 'pointer',
              }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onGenerate} disabled={loading || !value.trim()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            height: 'var(--control-md)', padding: '0 1.125rem',
            borderRadius: 'var(--radius-sm)', border: 'none',
            background: loading || !value.trim() ? 'var(--iris-200)' : 'var(--ai)',
            color: 'var(--white)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
          }}>
          <AISparkle size={15} />
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
