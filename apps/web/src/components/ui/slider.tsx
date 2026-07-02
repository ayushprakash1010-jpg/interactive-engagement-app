import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    
    // Calculate percentage for background fill
    const percentage = React.useMemo(() => {
      const numValue = Number(value);
      const numMin = Number(min);
      const numMax = Number(max);
      return Math.round(((numValue - numMin) / (numMax - numMin)) * 100);
    }, [value, min, max]);

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center h-5 group", className)}>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20 m-0"
          {...props}
        />
        {/* Custom Track */}
        <div className="absolute w-full h-1.5 bg-surface-sunken rounded-full overflow-hidden pointer-events-none z-0 group-hover:bg-surface-sunken/80 transition-colors">
          <div 
            className="h-full bg-brand transition-all duration-75 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Custom Thumb */}
        <div 
          className="absolute h-4 w-4 bg-surface-card border-2 border-brand rounded-full shadow-sm transition-all duration-75 ease-out pointer-events-none z-10 group-focus-within:ring-2 group-focus-within:ring-brand group-focus-within:ring-offset-2 group-focus-within:ring-offset-background"
          style={{ 
            left: `calc(${percentage}% - 8px)`,
          }}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';
