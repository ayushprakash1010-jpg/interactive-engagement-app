import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { type PostEventIntelligence } from '@/lib/ai';

export function CrossActivityAnalysis({ analysis }: { analysis: PostEventIntelligence['crossActivityAnalysis'] }) {
  return (
    <Card className="border-border/50 shadow-sm h-full">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold">Cross-Activity Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Most Engaging</p>
          <p className="text-sm font-medium text-foreground">{analysis.mostEngaging}</p>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Lowest Completion</p>
          <p className="text-sm font-medium text-foreground">{analysis.lowestCompletion}</p>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg border border-border/50 sm:col-span-2">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Most Discussed Topic</p>
          <p className="text-sm font-medium text-foreground">{analysis.mostDiscussedTopic}</p>
        </div>
        {analysis.highestRatedSpeaker && (
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50 sm:col-span-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Highest Rated Speaker</p>
            <p className="text-sm font-medium text-foreground">{analysis.highestRatedSpeaker}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
