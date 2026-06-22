import React from 'react';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info' | 'ai' | 'live';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Show a leading status dot. Tone `live` always shows an animated dot. */
  dot?: boolean;
  size?: 'sm' | 'md';
}

/** Compact status / category pill — event status, activity type, AI label, live indicator. */
export function Badge(props: BadgeProps): JSX.Element;
