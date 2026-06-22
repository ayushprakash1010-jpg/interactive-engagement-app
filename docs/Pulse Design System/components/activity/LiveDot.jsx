import React from 'react';

/** The animated "on-air" dot. Pulses while live. */
export function LiveDot({ size = 8, color = 'var(--live)', live = true, style = {} }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, ...style }}>
      {live && (
        <span aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: '50%', background: color,
          animation: 'pulse-live 1.6s var(--ease-standard) infinite',
        }} />
      )}
      <span style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: color }} />
    </span>
  );
}
