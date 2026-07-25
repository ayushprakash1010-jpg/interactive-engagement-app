'use client';

/**
 * usage-meter.tsx
 *
 * A compact usage progress bar showing X / limit used this month.
 * Used on the billing page and account page.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number | null;
  /** Icon element to display alongside the label */
  icon?: React.ReactNode;
  className?: string;
}

function getBarColor(percent: number): string {
  if (percent >= 90) return 'from-red-500 to-rose-600';
  if (percent >= 70) return 'from-amber-400 to-orange-500';
  return 'from-violet-500 to-purple-600';
}

export function UsageMeter({ label, used, limit, icon, className }: UsageMeterProps) {
  const isUnlimited = limit === null;
  const percent = isUnlimited ? 0 : Math.min(100, Math.round((used / limit!) * 100));
  const barColor = getBarColor(percent);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-slate-400">{icon}</span>
          )}
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          {isUnlimited ? (
            <span className="text-emerald-400 font-medium">Unlimited</span>
          ) : (
            <>
              <span className={percent >= 90 ? 'text-red-400 font-semibold' : 'text-white'}>
                {used.toLocaleString()}
              </span>
              {' / '}
              {limit!.toLocaleString()}
            </>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        {isUnlimited ? (
          <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40" />
        ) : (
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', barColor)}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>

      {/* Warning text */}
      {!isUnlimited && percent >= 90 && (
        <p className="text-xs text-red-400">
          {percent >= 100
            ? 'Limit reached — upgrade to continue'
            : `${100 - percent}% remaining this month`}
        </p>
      )}
    </div>
  );
}
