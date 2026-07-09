import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { type SentimentDetail } from '@/lib/ai';

export function SentimentInsights({ overall, distribution }: { overall: string, distribution: SentimentDetail[] }) {
  if (distribution.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm h-full">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold">Sentiment Insights</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Overall Sentiment</p>
          <p className="text-lg font-medium text-foreground">{overall}</p>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Emotion Distribution</p>
          {distribution.map((dist) => (
            <div key={dist.emotion} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{dist.emotion}</span>
                <span className="text-muted-foreground">{dist.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand rounded-full transition-all duration-500" 
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
