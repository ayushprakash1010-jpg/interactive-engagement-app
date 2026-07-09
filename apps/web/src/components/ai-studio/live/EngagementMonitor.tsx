import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { type LiveEngagementMetrics } from '@/lib/ai';

export function EngagementMonitor({ metrics }: { metrics: LiveEngagementMetrics }) {
  return (
    <Card className="border-border/50 shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-muted/10">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand" />
          Engagement Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Participation</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold leading-none">{metrics.participationRate}%</span>
            {metrics.engagementTrend === 'Up' && <TrendingUp className="h-4 w-4 text-emerald-500 mb-1" />}
            {metrics.engagementTrend === 'Down' && <TrendingDown className="h-4 w-4 text-red-500 mb-1" />}
            {metrics.engagementTrend === 'Flat' && <Minus className="h-4 w-4 text-muted-foreground mb-1" />}
          </div>
        </div>
        
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Response Time</p>
          <p className="text-lg font-medium leading-none mt-1">{metrics.averageResponseTimeSec}s</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Activity Level</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            metrics.audienceActivityLevel === 'High' ? 'bg-emerald-500/10 text-emerald-600' :
            metrics.audienceActivityLevel === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
            'bg-muted text-muted-foreground'
          }`}>
            {metrics.audienceActivityLevel}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Momentum</p>
          <span className="text-sm font-medium">{metrics.momentum}</span>
        </div>
        
        {metrics.silenceDetected && (
          <div className="col-span-2 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 font-medium flex items-center justify-center">
            Extended silence detected. Consider an intervention.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
