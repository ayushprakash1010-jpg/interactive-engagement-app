import * as React from 'react';
import { Button } from '@/components/ui';
import { Sparkles, Zap, Clock, Smile, Filter } from 'lucide-react';
import { type CopilotIntent } from '@/lib/ai';

export function QuickActionBar({ onSelect }: { onSelect: (intent: CopilotIntent) => void }) {
  const actions = [
    { label: 'Shorter Session', icon: Clock, intent: { action: 'ADJUST_DURATION', payload: { shorter: true }, description: 'Make the session 15 minutes shorter.' } },
    { label: 'Add Icebreaker', icon: Sparkles, intent: { action: 'ADD_INTERACTION', payload: { icebreaker: true }, description: 'Add a starting icebreaker.' } },
    { label: 'More Professional', icon: Filter, intent: { action: 'CHANGE_TONE', payload: { tone: 'Professional' }, description: 'Make the tone more professional.' } },
    { label: 'More Interactive', icon: Zap, intent: { action: 'ADD_INTERACTION', payload: { interactive: true }, description: 'Make the session more interactive.' } },
  ] as const;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <Button
            key={i}
            variant="outline"
            size="sm"
            onClick={() => onSelect(action.intent as CopilotIntent)}
            className="rounded-full shrink-0 snap-start bg-background text-muted-foreground hover:text-foreground h-7 px-3 text-xs"
          >
            <Icon className="h-3 w-3 mr-1.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
