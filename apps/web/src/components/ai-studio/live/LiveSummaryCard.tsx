import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { FileText } from 'lucide-react';

export function LiveSummaryCard({ summary }: { summary: string }) {
  if (!summary) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Live Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
