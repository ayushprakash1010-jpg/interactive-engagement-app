import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { type LiveRecommendation } from '@/lib/ai';

export function RecommendationFeed({ recommendations }: { recommendations: LiveRecommendation[] }) {
  if (recommendations.length === 0) return null;

  return (
    <Card className="border-brand/20 bg-brand/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-brand">
          <Lightbulb className="h-4 w-4" />
          Proactive Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col gap-3">
        {recommendations.map(rec => (
          <div key={rec.id} className="group relative bg-background rounded-md border p-3 shadow-sm hover:border-brand/50 transition-colors cursor-pointer">
            <h4 className="font-medium text-sm flex items-center justify-between">
              {rec.title}
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand" />
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {rec.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
