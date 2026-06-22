import React from 'react';

const PALETTE = ['#01696f', '#4f98a3', '#6daa45', '#d19900', '#da7101', '#006494', '#7a39bb', '#a12c7b'];

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Participant avatar — initials on a deterministic brand-palette fill, or an image. */
export function Avatar({ name = '', src, size = 'md', anonymous = false, style = {} }) {
  const dim = { sm: '1.75rem', md: '2.25rem', lg: '2.75rem', xl: '3.5rem' }[size];
  const font = { sm: 'var(--text-xs)', md: 'var(--text-sm)', lg: 'var(--text-base)', xl: 'var(--text-lg)' }[size];
  const bg = anonymous ? 'var(--surface-sunken)' : colorFor(name);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: dim, height: dim, flexShrink: 0, borderRadius: '50%', overflow: 'hidden',
      background: src ? 'var(--surface-sunken)' : bg,
      color: anonymous ? 'var(--text-muted)' : 'var(--white)',
      fontFamily: 'var(--font-sans)', fontSize: font, fontWeight: 'var(--weight-semibold)',
      ...style,
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : anonymous ? '·' : initials(name)}
    </span>
  );
}
