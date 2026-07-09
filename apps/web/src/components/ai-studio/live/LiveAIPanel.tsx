import * as React from 'react';
import { ai } from '@/lib/ai';
import { type LiveAssistantState } from '@/lib/ai/types/live';
import { Loader2, Sparkles, X } from 'lucide-react';
import { EngagementMonitor } from './EngagementMonitor';
import { AudienceMoodCard } from './AudienceMoodCard';
import { AlertCenter } from './AlertCenter';
import { RecommendationFeed } from './RecommendationFeed';
import { QuestionClusterPanel } from './QuestionClusterPanel';
import { LiveSummaryCard } from './LiveSummaryCard';
import { HostCopilot } from './HostCopilot';
import { LiveTimeline } from './LiveTimeline';
import { Button } from '@/components/ui';

interface LiveAIPanelProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  currentContext?: any;
}

export function LiveAIPanel({ eventId, isOpen, onClose, currentContext }: LiveAIPanelProps) {
  const [state, setState] = React.useState<LiveAssistantState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const contextRef = React.useRef(currentContext);
  const lastFetchedContextRef = React.useRef<any>(null);
  const lastFetchTimeRef = React.useRef<number>(0);
  
  React.useEffect(() => {
    contextRef.current = currentContext;
  }, [currentContext]);

  const fetchLiveState = React.useCallback(async (isMounted: () => boolean) => {
    try {
      const liveState = await ai.live.getLiveState(eventId, contextRef.current);
      if (isMounted()) {
        lastFetchedContextRef.current = contextRef.current;
        lastFetchTimeRef.current = Date.now();
        setState(liveState);
        setIsLoading(false);
        setError(null);
      }
    } catch (err) {
      if (isMounted()) {
        setError(err instanceof Error ? err : new Error('Failed to fetch live state'));
        setIsLoading(false);
      }
    }
  }, [eventId]);

  React.useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const isMounted = () => mounted;
    
    const now = Date.now();
    const prevContext = lastFetchedContextRef.current;
    const currContext = contextRef.current;
    
    let shouldFetch = false;
    
    if (!prevContext) {
      // First fetch
      shouldFetch = true;
    } else if (currContext) {
      const activeActivityChanged = currContext.activeActivity !== prevContext.activeActivity;
      const totalQuestions = currContext.totalQuestions || 0;
      const prevQuestions = prevContext.totalQuestions || 0;
      const questionDiff = Math.abs(totalQuestions - prevQuestions);
      const participantDiff = Math.abs((currContext.participantCount || 0) - (prevContext.participantCount || 0));
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      
      if (activeActivityChanged) {
        // Immediate fetch if activity changes
        shouldFetch = true;
      } else if (questionDiff >= 3) {
        // Burst of questions
        shouldFetch = true;
      } else if (timeSinceLastFetch >= 30000 && (questionDiff > 0 || participantDiff >= 5)) {
        // Time elapsed and there is SOME new activity (at least 1 question or 5+ participant change)
        shouldFetch = true;
      }
    }

    if (shouldFetch) {
      fetchLiveState(isMounted);
    }

    // Backup interval just to catch any stale state if time passes without context changes
    // (but only fetches if there's actual new context we missed)
    const interval = setInterval(() => {
      const curr = contextRef.current;
      const prev = lastFetchedContextRef.current;
      const elapsed = Date.now() - lastFetchTimeRef.current;
      
      if (curr && prev && elapsed >= 30000) {
        const qDiff = Math.abs((curr.totalQuestions || 0) - (prev.totalQuestions || 0));
        const pDiff = Math.abs((curr.participantCount || 0) - (prev.participantCount || 0));
        
        if (qDiff > 0 || pDiff >= 5 || curr.activeActivity !== prev.activeActivity) {
          fetchLiveState(isMounted);
        }
      }
    }, 15000); // check every 15s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [eventId, isOpen, currentContext, fetchLiveState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md h-full bg-slate-50 dark:bg-slate-950 border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b bg-background flex-none relative">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-brand" />
              Live AI Assistant
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time event intelligence and co-hosting.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {isLoading && !state ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm">Initializing Live Intelligence...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-900 rounded-md text-sm border border-red-200">
              Error connecting to live assistant: {error.message}
            </div>
          ) : state ? (
            <>
              <AlertCenter alerts={state.alerts} />
              
              <div className="grid grid-cols-1 gap-4">
                <EngagementMonitor metrics={state.metrics} />
                <AudienceMoodCard mood={state.mood} />
              </div>

              <RecommendationFeed recommendations={state.recommendations} />
              
              <QuestionClusterPanel clusters={state.questionClusters} />
              
              <LiveSummaryCard summary={state.liveSummary} />
              
              <LiveTimeline timeRemainingSec={state.timeRemainingSec} />
              
              <HostCopilot />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
