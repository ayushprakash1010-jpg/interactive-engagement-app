import * as React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

export function GenerationProgress() {
  const [step, setStep] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const steps = [
    'Understanding request...',
    'Planning activities...',
    'Generating draft...',
    'Preparing workspace...',
  ];

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      if (Date.now() - startTime > 10000) {
        setIsRetrying(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-border bg-card shadow-sm border-dashed">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <div className="h-16 w-16 bg-background rounded-full border shadow-sm flex items-center justify-center relative z-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold animate-pulse">
            {isRetrying ? 'AI is experiencing high traffic, retrying...' : steps[step]}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRetrying 
              ? 'Please wait, the AI service is currently busy but we are still trying to generate your session.' 
              : 'This may take a few seconds.'}
          </p>
        </div>
        <div className="w-full max-w-xs bg-muted rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
