import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

/** Multi-line input; shows a live counter when `maxLength` is set. */
export function Textarea(props: TextareaProps): JSX.Element;
