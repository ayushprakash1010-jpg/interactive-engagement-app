import React from 'react';

export interface AIBadgeProps {
  label?: string;
  /** Use the iris→teal AI gradient fill. */
  gradient?: boolean;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export interface AISparkleProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

/** Pill marking AI-generated content. */
export function AIBadge(props: AIBadgeProps): JSX.Element;
/** The Pulse AI sparkles glyph (inline SVG). */
export function AISparkle(props: AISparkleProps): JSX.Element;
