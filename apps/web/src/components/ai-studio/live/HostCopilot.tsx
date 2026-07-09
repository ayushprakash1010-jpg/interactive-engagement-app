import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Bot, Send, Loader2 } from 'lucide-react';

export function HostCopilot() {
  const [input, setInput] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsProcessing(true);
    // Mock processing delay for Phase 7
    setTimeout(() => {
      setIsProcessing(false);
      setInput('');
    }, 1000);
  };

  return (
    <Card className="border-border/50 shadow-sm flex flex-col">
      <CardHeader className="pb-2 flex-none">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-brand" />
          Host Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col gap-3">
        <div className="flex-1 bg-muted/30 rounded-md p-3 text-sm text-muted-foreground min-h-[100px] flex items-center justify-center border border-dashed">
          Ask me to summarize questions, generate a poll, or analyze sentiment.
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isProcessing}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
