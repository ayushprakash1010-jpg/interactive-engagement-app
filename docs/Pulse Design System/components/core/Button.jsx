import React from 'react';

/**
 * Pulse Button — the primary action primitive.
 * Variants map to the IEP action hierarchy; `ai` is reserved for
 * AI-assisted actions (generate, summarize, suggest).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  style = {},
  children,
  ...rest
}) {
  const sizes = {
    sm: { height: 'var(--control-sm)', padding: '0 0.75rem', font: 'var(--text-sm)', gap: '0.375rem' },
    md: { height: 'var(--control-md)', padding: '0 1rem',    font: 'var(--text-sm)', gap: '0.5rem' },
    lg: { height: 'var(--control-lg)', padding: '0 1.25rem', font: 'var(--text-base)', gap: '0.5rem' },
    xl: { height: 'var(--control-xl)', padding: '0 1.75rem', font: 'var(--text-lg)', gap: '0.625rem' },
  }[size];

  const variants = {
    primary: {
      background: 'var(--brand)', color: 'var(--text-on-brand)',
      border: '1px solid transparent', '--hover-bg': 'var(--brand-hover)',
    },
    secondary: {
      background: 'var(--surface-card)', color: 'var(--text-primary)',
      border: '1px solid var(--border-default)', '--hover-bg': 'var(--surface-offset)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)',
      border: '1px solid transparent', '--hover-bg': 'var(--surface-offset)',
    },
    danger: {
      background: 'var(--error)', color: 'var(--white)',
      border: '1px solid transparent', '--hover-bg': 'var(--error-hover)',
    },
    ai: {
      background: 'var(--ai)', color: 'var(--white)',
      border: '1px solid transparent', '--hover-bg': 'var(--ai-hover)',
    },
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.background = variants['--hover-bg']; }}
      onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.background = variants.background; }}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes.gap,
        height: sizes.height,
        padding: sizes.padding,
        fontFamily: 'var(--font-sans)',
        fontSize: sizes.font,
        fontWeight: 'var(--weight-semibold)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        borderRadius: 'var(--radius-sm)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !loading ? 0.5 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
        ...variants,
        ...style,
      }}
      onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateY(1px)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: '1em', height: '1em', borderRadius: '50%',
        border: '2px solid currentColor', borderTopColor: 'transparent',
        display: 'inline-block', animation: 'spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}
