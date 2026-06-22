import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual + semantic role. `ai` is reserved for AI-assisted actions. @default 'primary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /** Stretch to fill its container (full-width on participant phone). */
  block?: boolean;
  /** Show a spinner and disable. */
  loading?: boolean;
  /** Lucide icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Lucide icon node rendered after the label. */
  iconRight?: React.ReactNode;
}

/**
 * The primary action button for Pulse.
 * @startingPoint section="Core" subtitle="Primary action button — 5 variants, 4 sizes" viewport="700x200"
 */
export function Button(props: ButtonProps): JSX.Element;
