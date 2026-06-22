import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + teal border — use for clickable tiles. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  tone?: 'default' | 'raised' | 'ai' | 'dashed';
}

/**
 * The core surface container — event tiles, panels, empty states.
 * @startingPoint section="Core" subtitle="Surface container with interactive + AI tones" viewport="700x220"
 */
export function Card(props: CardProps): JSX.Element;
