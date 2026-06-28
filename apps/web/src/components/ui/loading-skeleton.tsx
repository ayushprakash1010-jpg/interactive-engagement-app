import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'block' | 'card' | 'text' | 'avatar' | 'title';
}

const variantClass = {
  block: 'h-32 rounded-lg',
  card: 'h-40 rounded-lg border border-border bg-surface-card',
  text: 'h-4 rounded-md',
  title: 'h-6 rounded-md',
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
        'animate-[pulse_1.5s_ease-in-out_infinite] bg-surface-sunken',
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

// ---------------------------------------------------------------------------
// Specialized Skeletons (Progressive Loading)
// ---------------------------------------------------------------------------

function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-border/40 shadow-xs", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-4 w-full">
            <LoadingSkeleton variant="text" className="w-24 h-3.5 bg-surface-sunken/80" />
            <LoadingSkeleton variant="title" className="w-16 h-8 bg-surface-sunken" />
          </div>
          <LoadingSkeleton variant="avatar" className="h-10 w-10 shrink-0 bg-surface-sunken/80 rounded-md" />
        </div>
        <div className="mt-5 flex items-center gap-2">
          <LoadingSkeleton variant="text" className="w-32 h-3 bg-surface-sunken/60" />
        </div>
      </CardContent>
    </Card>
  );
}

function ListRowSkeleton({ className, hasAction = true }: { className?: string; hasAction?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 px-4 py-3 border-b border-border/40 last:border-0", className)}>
      <LoadingSkeleton variant="avatar" className="h-8 w-8 shrink-0 bg-surface-sunken/80 rounded-md" />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton variant="text" className="w-48 h-3.5 bg-surface-sunken" />
        <LoadingSkeleton variant="text" className="w-32 h-2.5 bg-surface-sunken/60" />
      </div>
      {hasAction && (
        <div className="shrink-0 flex gap-2">
          <LoadingSkeleton variant="block" className="w-16 h-8 bg-surface-sunken/50 rounded-md" />
        </div>
      )}
    </div>
  );
}

function ListSkeleton({ count = 5, className, hasAction = true }: { count?: number; className?: string; hasAction?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface-card divide-y divide-border/40 shadow-xs", className)}>
      {Array.from({ length: count }, (_, index) => (
        <ListRowSkeleton key={index} hasAction={hasAction} />
      ))}
    </div>
  );
}

const CHART_HEIGHTS = [45, 75, 40, 90, 60, 30, 85, 55];

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-border shadow-xs", className)}>
      <CardHeader className="pb-4 border-b border-border/40">
         <LoadingSkeleton variant="title" className="w-32 h-5 bg-surface-sunken" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[200px] flex items-end justify-between gap-2 pt-4">
           {CHART_HEIGHTS.map((height, i) => (
             <div key={i} className="w-full bg-surface-sunken/50 animate-[pulse_1.5s_ease-in-out_infinite] rounded-t-sm" style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }} />
           ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-border/40 shadow-xs", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <LoadingSkeleton variant="avatar" className="h-20 w-20 shrink-0 bg-surface-sunken rounded-full shadow-sm" />
          <div className="flex-1 space-y-3">
            <LoadingSkeleton variant="title" className="w-48 h-6 bg-surface-sunken" />
            <LoadingSkeleton variant="text" className="w-32 h-4 bg-surface-sunken/60" />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border/40">
          <LoadingSkeleton variant="text" className="w-64 h-3 bg-surface-sunken/50" />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityTileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-ai-border/40 bg-surface-card p-5 text-left transition-all shadow-sm", className)}>
      <div className="absolute inset-0 pulse-shimmer opacity-30" />
      <div className="relative space-y-4">
        <LoadingSkeleton variant="avatar" className="h-10 w-10 bg-ai-subtle/50 rounded-md" />
        <div className="space-y-2">
          <LoadingSkeleton variant="title" className="h-4 w-3/4 bg-surface-sunken" />
          <LoadingSkeleton variant="text" className="h-3 w-full bg-surface-sunken/60" />
          <LoadingSkeleton variant="text" className="h-3 w-5/6 bg-surface-sunken/60" />
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col lg:flex-row gap-8", className)}>
      <div className="w-full lg:w-64 shrink-0 space-y-2">
         {Array.from({ length: 6 }).map((_, i) => (
           <LoadingSkeleton key={i} variant="text" className="h-9 w-full bg-surface-sunken/60 rounded-md" />
         ))}
      </div>
      <div className="flex-1 space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <LoadingSkeleton variant="title" className="h-6 w-32 bg-surface-sunken" />
            <LoadingSkeleton variant="text" className="h-3 w-64 bg-surface-sunken/60 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
             {Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="flex justify-between items-center py-2">
                  <div className="space-y-2">
                     <LoadingSkeleton variant="text" className="h-4 w-40 bg-surface-sunken" />
                     <LoadingSkeleton variant="text" className="h-3 w-56 bg-surface-sunken/60" />
                  </div>
                  <LoadingSkeleton variant="block" className="h-6 w-10 bg-surface-sunken/80 rounded-full" />
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { 
  LoadingSkeleton, 
  LoadingSkeletonGrid, 
  MetricCardSkeleton, 
  ListRowSkeleton, 
  ListSkeleton, 
  ChartSkeleton, 
  ProfileSkeleton, 
  ActivityTileSkeleton,
  SettingsSkeleton
};
