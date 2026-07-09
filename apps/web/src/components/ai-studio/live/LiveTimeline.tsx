import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Clock } from 'lucide-react';

export function LiveTimeline({ timeRemainingSec }: { timeRemainingSec?: number }) {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Event Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Time Remaining</span>
          <span className="font-mono font-medium">{timeRemainingSec !== undefined ? formatTime(timeRemainingSec) : '--:--'}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
          {/* Mock progress bar */}
          <div className="bg-brand h-full rounded-full" style={{ width: '60%' }} />
        </div>
      </CardContent>
    </Card>
  );
}
