import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export function RecommendationPanel({ recommendations, followUps }: { recommendations: string[], followUps: string[] }) {
  if (recommendations.length === 0 && followUps.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Recommendations & Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col md:flex-row">
        {recommendations.length > 0 && (
          <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-border/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">AI Recommendations</h4>
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                    <span className="text-[10px] font-bold">{i+1}</span>
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {followUps.length > 0 && (
          <div className="flex-1 p-4 bg-muted/5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Follow-up Suggestions</h4>
            <ul className="space-y-3">
              {followUps.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
