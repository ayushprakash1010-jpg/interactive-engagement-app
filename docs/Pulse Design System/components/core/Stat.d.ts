import React from 'react';

export interface StatProps {
  value: string | number;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'brand' | 'ai';
  style?: React.CSSProperties;
}

/** Headline metric (participants, responses, participation rate). */
export function Stat(props: StatProps): JSX.Element;
