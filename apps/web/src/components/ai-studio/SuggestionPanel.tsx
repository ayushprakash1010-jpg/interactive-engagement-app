import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Lightbulb, Plus, ArrowRight } from 'lucide-react';
import { type PlanningRecommendation } from '@/lib/ai';

export function SuggestionPanel({ recommendations = [] }: { recommendations?: PlanningRecommendation[] }) {
  // If no dynamic recommendations, we can fallback to some static ones for testing,
  // but in Phase 2 we use the dynamic ones exclusively if provided.
  const displayRecs = recommendations;

  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AI Suggestions
        </CardTitle>
        <CardDescription>Recommendations based on your session plan.</CardDescription>
      </CardHeader>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {displayRecs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recommendations at this time. Your plan looks great!
          </p>
        ) : (
          displayRecs.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className="group p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors"
            >
              <h4 className="text-sm font-semibold mb-1 flex items-center justify-between">
                {suggestion.title}
                {suggestion.priority === 'high' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="High Priority" />
                )}
              </h4>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {suggestion.description}
              </p>
              {suggestion.action && (
                <button className="text-xs font-medium text-primary flex items-center gap-1 group-hover:underline">
                  <Plus className="h-3 w-3" />
                  {suggestion.action}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
