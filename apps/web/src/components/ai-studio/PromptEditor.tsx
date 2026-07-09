import * as React from 'react';
import { Button, Textarea, Card, CardContent } from '@/components/ui';
import { Sparkles, Command, ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PromptEditor({
  prompt,
  setPrompt,
  onGenerate,
  generating,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your session, or paste an agenda here..."
          className="min-h-[120px] w-full resize-none border-0 bg-transparent py-4 pl-4 pr-12 focus-visible:ring-0 text-base"
          disabled={generating}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {prompt.length > 0 && (
            <span className="text-xs text-muted-foreground mr-2 font-mono">
              {prompt.length}
            </span>
          )}
          <Button 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            disabled={!prompt.trim() || generating}
            onClick={onGenerate}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Need inspiration? Try a template:</span>
          <button 
            className="hover:text-primary underline underline-offset-2 ml-1"
            onClick={() => setPrompt('A retro that gathers wins, blockers, and a mood rating')}
            disabled={generating}
          >
            Retro
          </button>
          <span>•</span>
          <button 
            className="hover:text-primary underline underline-offset-2"
            onClick={() => setPrompt('A 30-minute product kickoff for 80 people with an icebreaker')}
            disabled={generating}
          >
            Kickoff
          </button>
          <span>•</span>
          <button 
            className="hover:text-primary underline underline-offset-2"
            onClick={() => setPrompt('An icebreaker plus a 5-question trivia round')}
            disabled={generating}
          >
            Trivia
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1 opacity-70">
          <kbd className="font-sans border bg-muted rounded px-1.5 py-0.5 text-[10px] flex items-center gap-0.5">
            <Command className="h-3 w-3" />
            Enter
          </kbd>
          <span>to generate</span>
        </div>
      </div>
    </div>
  );
}
