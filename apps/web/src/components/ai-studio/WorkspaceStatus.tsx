import * as React from 'react';
import { Card, CardContent } from '@/components/ui';
import { Bot, CheckCircle2, ListChecks, Clock, Activity } from 'lucide-react';

export function WorkspaceStatus({
  generatedCount,
  acceptedCount,
  estimatedDuration,
  isGenerating,
}: {
  generatedCount: number;
  acceptedCount: number;
  estimatedDuration: string;
  isGenerating: boolean;
}) {
  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Workspace Status
        </span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {isGenerating ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            )}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isGenerating ? 'Generating' : 'Idle'}
          </span>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-border">
          <div className="p-3 flex flex-col justify-center items-center text-center">
            <ListChecks className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xl font-bold">{generatedCount}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Generated</span>
          </div>
          <div className="p-3 flex flex-col justify-center items-center text-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mb-1" />
            <span className="text-xl font-bold">{acceptedCount}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Accepted</span>
          </div>
          <div className="p-3 flex flex-col justify-center items-center text-center">
            <Clock className="h-4 w-4 text-amber-500 mb-1" />
            <span className="text-xl font-bold">{estimatedDuration}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Est. Duration</span>
          </div>
          <div className="p-3 flex flex-col justify-center items-center text-center">
            <Bot className="h-4 w-4 text-indigo-500 mb-1" />
            <span className="text-sm font-semibold truncate w-full px-2" title="Gemini 3.1 Pro">Gemini 3.1 Pro</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Model</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
