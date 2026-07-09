import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { History, Check, X, Bot, User } from 'lucide-react';
import { type CopilotState } from '@/lib/ai';
import { cn } from '@/lib/utils';

export function SessionHistory({ history }: { history: CopilotState['history'] }) {
  if (history.length === 0) return null;

  return (
    <Card className="border-border bg-card shadow-sm mt-6">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {history.slice().reverse().map((item, i) => {
            let Icon = Bot;
            let color = "text-muted-foreground";
            
            if (item.type === 'accepted') { Icon = Check; color = "text-emerald-500"; }
            if (item.type === 'rejected') { Icon = X; color = "text-rose-500"; }
            if (item.type === 'user') { Icon = User; color = "text-indigo-500"; }

            return (
              <div key={i} className="flex items-start gap-3 p-3 border-b last:border-0 text-sm">
                <div className={cn("mt-0.5", color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60 block mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
