import React from 'react';

export interface AIComposerProps {
  value?: string;
  onChange?: (next: string) => void;
  onGenerate?: () => void;
  placeholder?: string;
  /** Tappable example prompts shown under the field. */
  suggestions?: string[];
  loading?: boolean;
  style?: React.CSSProperties;
}

/**
 * AI prompt composer — "describe it, Pulse drafts it." Drives AI generation of polls, quizzes, agendas.
 * @startingPoint section="AI" subtitle="AI prompt composer with suggestions" viewport="700x280"
 */
export function AIComposer(props: AIComposerProps): JSX.Element;
