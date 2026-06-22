import React from 'react';

export interface AITheme { label: string; count?: number; }

export interface AISummaryCardProps {
  title?: string;
  body?: string;
  /** Bullet themes — strings, or { label, count } for tallies. */
  themes?: Array<string | AITheme>;
  /** Show the animated generating state. */
  shimmer?: boolean;
  footnote?: string;
  style?: React.CSSProperties;
}

/**
 * AI readout that distills open responses / Q&A / sentiment into a summary.
 * @startingPoint section="AI" subtitle="AI summary of responses with themes" viewport="700x300"
 */
export function AISummaryCard(props: AISummaryCardProps): JSX.Element;
