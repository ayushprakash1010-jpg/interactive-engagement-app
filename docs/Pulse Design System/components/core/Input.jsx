import React from 'react';

/** Text input. `code` styles it as a centered mono join-code field. */
export function Input({
  label,
  hint,
  error,
  code = false,
  size = 'md',
  id,
  style = {},
  ...rest
}) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const height = { sm: 'var(--control-sm)', md: 'var(--control-md)', lg: 'var(--control-lg)' }[size];
  const [focused, setFocused] = React.useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)', color: 'var(--text-secondary)',
        }}>{label}</label>
      )}
      <input
        id={inputId}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: code ? '3.5rem' : height,
          padding: code ? '0 0.75rem' : '0 0.75rem',
          fontFamily: code ? 'var(--font-mono)' : 'var(--font-sans)',
          fontSize: code ? 'var(--text-2xl)' : 'var(--text-sm)',
          fontWeight: code ? 'var(--weight-bold)' : 'var(--weight-regular)',
          letterSpacing: code ? 'var(--tracking-code)' : 'normal',
          textAlign: code ? 'center' : 'left',
          color: 'var(--text-primary)',
          background: 'var(--surface-card)',
          border: `1px solid ${error ? 'var(--error)' : focused ? 'var(--ring-focus)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: focused ? `0 0 0 3px ${error ? 'var(--error-subtle)' : 'rgba(26,125,131,0.16)'}` : 'none',
          outline: 'none',
          transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
          ...style,
        }}
        {...rest}
      />
      {(hint || error) && (
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          color: error ? 'var(--error)' : 'var(--text-muted)',
        }}>{error || hint}</span>
      )}
    </div>
  );
}
