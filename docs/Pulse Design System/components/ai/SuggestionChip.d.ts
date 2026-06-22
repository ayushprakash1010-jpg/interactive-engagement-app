import React from 'react';

export interface SuggestionChipProps {
  text: string;
  onAccept?: () => void;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Accept/dismiss AI suggestion (drafted question, follow-up poll, moderation tip). */
export function SuggestionChip(props: SuggestionChipProps): JSX.Element;
