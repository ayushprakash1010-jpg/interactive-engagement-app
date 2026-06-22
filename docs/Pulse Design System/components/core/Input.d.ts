import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Render as a large centered mono join-code field. */
  code?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Text field with label, hint, error, and a `code` join-code mode. */
export function Input(props: InputProps): JSX.Element;
