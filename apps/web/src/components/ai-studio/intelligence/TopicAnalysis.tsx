import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { type TopicCluster } from '@/lib/ai';

export function TopicAnalysis({ topics }: { topics: TopicCluster[] }) {
  if (topics.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold">Topic Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-4 md:grid-cols-2">
        {topics.map(topic => (
          <div key={topic.name} className="border rounded-lg p-4 bg-card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {topic.name}
                  {topic.trend === 'Up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {topic.trend === 'Down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {topic.trend === 'Flat' && <Minus className="h-3 w-3 text-muted-foreground" />}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{topic.mentions} mentions</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                topic.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-600' :
                topic.sentiment === 'Negative' ? 'bg-red-500/10 text-red-600' :
                'bg-muted text-muted-foreground'
              }`}>
                {topic.sentiment}
              </div>
            </div>
            {topic.quotes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Representative Quotes</p>
                {topic.quotes.map((quote, i) => (
                  <p key={i} className="text-xs text-foreground italic border-l-2 border-muted-foreground/30 pl-2 py-0.5">
                    &quot;{quote}&quot;
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
