import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'block' | 'card' | 'text' | 'avatar';
}

const variantClass = {
  block: 'h-32 rounded-lg',
  card: 'h-40 rounded-lg border border-border',
  text: 'h-4 rounded-md',
  avatar: 'h-10 w-10 rounded-full',
};

function LoadingSkeleton({
  variant = 'block',
  className,
  ...props
}: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-surface-sunken',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

function LoadingSkeletonGrid({
  count = 4,
  className,
  itemClassName,
}: {
  count?: number;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <LoadingSkeleton key={index} variant="card" className={itemClassName} />
      ))}
    </div>
  );
}

export { LoadingSkeleton, LoadingSkeletonGrid };
