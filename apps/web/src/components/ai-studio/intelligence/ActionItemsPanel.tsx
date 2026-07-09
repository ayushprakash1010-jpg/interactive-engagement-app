import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import { type ActionItem } from '@/lib/ai';

export function ActionItemsPanel({ items }: { items: ActionItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold">Action Items</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {items.map(item => (
            <div key={item.id} className="p-4 hover:bg-muted/10 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground bg-muted/30">
                      Owner: {item.owner}
                    </Badge>
                    <Badge variant={item.status === 'Completed' ? 'success' : 'neutral'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`shrink-0 ${
                    item.priority === 'High' ? 'border-red-500/50 text-red-600 bg-red-500/5' :
                    item.priority === 'Medium' ? 'border-amber-500/50 text-amber-600 bg-amber-500/5' :
                    'border-blue-500/50 text-blue-600 bg-blue-500/5'
                  }`}
                >
                  {item.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
