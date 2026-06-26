import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ActionGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'between';
}

const alignClass = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
};

function ActionGroup({
  align = 'end',
  className,
  children,
  ...props
}: ActionGroupProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        alignClass[align],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { ActionGroup };
