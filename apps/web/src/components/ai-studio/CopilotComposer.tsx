import * as React from 'react';
import { Button } from '@/components/ui';
import { CornerDownLeft, Sparkles } from 'lucide-react';
import { type CopilotIntent } from '@/lib/ai';
import { cn } from '@/lib/utils';

export function CopilotComposer({
  onSubmit,
  isProcessing
}: {
  onSubmit: (intent: CopilotIntent) => void;
  isProcessing: boolean;
}) {
  const [text, setText] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit({
      action: 'CUSTOM_PROMPT',
      description: text.trim(),
    });
    setText('');
  };

  return (
    <div className="relative rounded-xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Copilot to change the plan..."
        className="w-full min-h-[80px] bg-transparent border-0 p-3 pr-12 resize-none focus:ring-0 sm:text-sm"
        disabled={isProcessing}
      />
      <div className="absolute bottom-2 right-2 flex items-center">
        <Button
          size="icon"
          className={cn("h-8 w-8 rounded-lg", isProcessing && "animate-pulse")}
          onClick={submit}
          disabled={!text.trim() || isProcessing}
        >
          {isProcessing ? <Sparkles className="h-4 w-4" /> : <CornerDownLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
