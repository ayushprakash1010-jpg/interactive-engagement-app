import React from 'react';

/** Square icon-only button. Always pass an accessible `label`. */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  active = false,
  disabled = false,
  style = {},
  children,
  ...rest
}) {
  const dim = { sm: '2rem', md: '2.5rem', lg: '2.75rem' }[size];
  const variants = {
    ghost: { background: active ? 'var(--surface-offset)' : 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent', hover: 'var(--surface-offset)' },
    outline: { background: 'var(--surface-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', hover: 'var(--surface-offset)' },
    brand: { background: 'var(--brand-subtle)', color: 'var(--brand)', border: '1px solid transparent', hover: 'var(--teal-100)' },
  }[variant];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = variants.hover; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = variants.background; }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim, flexShrink: 0,
        borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard)',
        background: variants.background, color: variants.color, border: variants.border,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
