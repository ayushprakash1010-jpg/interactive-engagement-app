import React from 'react';

/** Multi-line text input with optional label and character counter. */
export function Textarea({ label, hint, value, maxLength, rows = 4, id, style = {}, onChange, ...rest }) {
  const inputId = id || (label ? `ta-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const [focused, setFocused] = React.useState(false);
  const len = typeof value === 'string' ? value.length : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)', color: 'var(--text-secondary)',
        }}>{label}</label>
      )}
      <textarea
        id={inputId} rows={rows} value={value} maxLength={maxLength} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '0.625rem 0.75rem', resize: 'vertical',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-normal)', color: 'var(--text-primary)',
          background: 'var(--surface-card)',
          border: `1px solid ${focused ? 'var(--ring-focus)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: focused ? '0 0 0 3px rgba(26,125,131,0.16)' : 'none',
          outline: 'none',
          transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
          ...style,
        }}
        {...rest}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span>
        {maxLength && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>{len}/{maxLength}</span>
        )}
      </div>
    </div>
  );
}
