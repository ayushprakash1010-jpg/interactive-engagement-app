import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export function KeyTakeawaysPanel({ takeaways }: { takeaways: string[] }) {
  if (takeaways.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-sm h-full">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold">Key Takeaways</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-3">
          {takeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ArrowRight className="h-3 w-3" />
              </span>
              <span className="text-sm text-foreground leading-relaxed">{takeaway}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
