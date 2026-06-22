import React from 'react';

/** Boolean toggle. Controlled via `checked` + `onChange(next)`. */
export function Switch({ checked = false, onChange, disabled = false, label, size = 'md', id }) {
  const dims = size === 'sm'
    ? { w: '2rem', h: '1.125rem', knob: '0.875rem', travel: '0.875rem' }
    : { w: '2.5rem', h: '1.5rem', knob: '1.125rem', travel: '1rem' };
  const switchId = id || (label ? `sw-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const toggle = () => { if (!disabled && onChange) onChange(!checked); };
  return (
    <label htmlFor={switchId} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <button
        id={switchId} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={toggle}
        style={{
          position: 'relative', width: dims.w, height: dims.h, flexShrink: 0,
          borderRadius: 'var(--radius-full)', border: 'none', padding: 0,
          background: checked ? 'var(--brand)' : 'var(--sand-400)',
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
          transition: 'background var(--dur-base) var(--ease-standard)',
        }}
      >
        <span style={{
          position: 'absolute', top: '50%', left: '0.1875rem',
          width: dims.knob, height: dims.knob, borderRadius: '50%', background: 'var(--white)',
          boxShadow: 'var(--shadow-sm)',
          transform: `translateY(-50%) translateX(${checked ? dims.travel : '0'})`,
          transition: 'transform var(--dur-base) var(--ease-spring)',
        }} />
      </button>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</span>
      )}
    </label>
  );
}
