import * as React from 'react';
import { EmptyState } from '@/components/ui';
import { WandSparkles, Sparkles } from 'lucide-react';

export function WorkspaceEmptyState({
  type,
}: {
  type: 'draft' | 'history' | 'suggestions';
}) {
  if (type === 'suggestions') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed mt-4">
        <Sparkles className="h-6 w-6 mb-2 opacity-50" />
        <p className="text-sm">Generate a draft to see AI suggestions.</p>
      </div>
    );
  }

  if (type === 'history') {
    return (
      <EmptyState
        icon={<History className="h-6 w-6" />}
        title="No history yet"
        description="Your past AI generations will appear here."
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <EmptyState
        tone="ai"
        icon={<WandSparkles className="h-8 w-8" />}
        title="Your workspace is empty"
        description="Describe your session in the prompt below to generate a tailored engagement plan."
      />
    </div>
  );
}

// Just a local import for the icon used in history since we didn't add it to lucide-react above
import { History } from 'lucide-react';
