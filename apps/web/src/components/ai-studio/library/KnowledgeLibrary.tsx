import * as React from 'react';
import { type SessionTemplate, type ActivityTemplate, ai } from '@/lib/ai';
import { Button } from '@/components/ui';
import { Sparkles, Loader2 } from 'lucide-react';
import { LibrarySidebar } from './LibrarySidebar';
import { SearchToolbar } from './SearchToolbar';
import { TemplateGrid } from './TemplateGrid';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface KnowledgeLibraryProps {
  onInsertSession: (plan: any) => void;
  onInsertActivity: (activity: any) => void;
}

export function KnowledgeLibrary({ onInsertSession, onInsertActivity }: KnowledgeLibraryProps) {
  const [activeTab, setActiveTab] = React.useState('sessions');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [sessionTemplates, setSessionTemplates] = React.useState<SessionTemplate[]>([]);
  const [activityTemplates, setActivityTemplates] = React.useState<ActivityTemplate[]>([]);
  
  const [selectedTemplate, setSelectedTemplate] = React.useState<SessionTemplate | ActivityTemplate | null>(null);

  const [aiTemplates, setAiTemplates] = React.useState<ActivityTemplate[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Load mock data from Library Service
    ai.library.getSessionTemplates().then(setSessionTemplates);
    ai.library.getActivityTemplates().then(setActivityTemplates);
  }, []);

  const getFilteredTemplates = () => {
    let list: Array<SessionTemplate | ActivityTemplate> = [];
    if (activeTab === 'sessions') list = sessionTemplates;
    if (activeTab === 'activities') list = activityTemplates;
    if (activeTab === 'favorites') {
      list = [...sessionTemplates, ...activityTemplates].filter(t => t.isFavorite);
    }
    
    if (activeTab === 'activities' || activeTab === 'sessions') {
      list = [...aiTemplates, ...list];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const handleGenerateAI = async () => {
    if (!searchQuery.trim()) return;
    setIsGenerating(true);
    setIsRetrying(false);
    setGenerateError(null);

    const retryTimer = setTimeout(() => {
      setIsRetrying(true);
    }, 8000);

    try {
      const res = await fetch('/api/proxy/ai/generate-activity-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchQuery }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI activities');
      }

      const data = await res.json();
      if (data.templates && Array.isArray(data.templates)) {
        setAiTemplates(prev => [...data.templates, ...prev]);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      clearTimeout(retryTimer);
      setIsGenerating(false);
      setIsRetrying(false);
    }
  };

  const handleInsert = (template: SessionTemplate | ActivityTemplate) => {
    if (template.type === 'session') {
      onInsertSession(template.plan);
    } else {
      onInsertActivity(template.activity);
    }
    setSelectedTemplate(null);
  };

  return (
    <div className="flex h-full bg-background border rounded-lg overflow-hidden">
      <LibrarySidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-1">Knowledge Library</h2>
          <p className="text-muted-foreground">Discover, preview, and insert AI templates into your workspace.</p>
        </div>

        <SearchToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {searchQuery.trim() && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Generate AI Templates
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Don't see what you need? Let Gemini generate a custom poll, word cloud, or quiz about "{searchQuery}".
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleGenerateAI} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isRetrying ? 'AI is busy, retrying...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Activities
                  </>
                )}
              </Button>
              {generateError && <span className="text-xs text-destructive">{generateError}</span>}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <TemplateGrid 
            templates={getFilteredTemplates()} 
            onSelect={setSelectedTemplate} 
          />
        </div>
      </div>

      <TemplatePreviewModal 
        template={selectedTemplate} 
        onClose={() => setSelectedTemplate(null)} 
        onInsert={handleInsert}
      />
    </div>
  );
}
