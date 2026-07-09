import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Layers, Zap } from 'lucide-react';
import { type QuestionCluster } from '@/lib/ai';

export function QuestionClusterPanel({ clusters }: { clusters: QuestionCluster[] }) {
  if (clusters.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Question Clusters
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col gap-3">
        {clusters.map(cluster => (
          <div key={cluster.id} className="flex flex-col gap-1.5 p-3 rounded-md bg-muted/40 border border-transparent hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center gap-1.5">
                {cluster.isPriority && <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />}
                {cluster.topic}
              </h4>
              <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded-sm border">
                {cluster.questionIds.length} Qs
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold">
              <span className={
                cluster.sentiment === 'Positive' ? 'text-emerald-600' :
                cluster.sentiment === 'Negative' ? 'text-red-600' :
                'text-muted-foreground'
              }>
                {cluster.sentiment} Sentiment
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
