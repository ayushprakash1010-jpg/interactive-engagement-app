import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  /** Required accessible label (also used as tooltip). */
  label: string;
  active?: boolean;
}

/** Square icon-only button for toolbars and card actions. */
export function IconButton(props: IconButtonProps): JSX.Element;
