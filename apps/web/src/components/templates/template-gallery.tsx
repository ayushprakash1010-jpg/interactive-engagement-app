'use client';

import * as React from 'react';
import { EVENT_TEMPLATES, type EventTemplate } from '@/lib/templates';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { 
  Clock, 
  Users, 
  Zap, 
  LayoutTemplate,
  BarChart3,
  ListChecks,
  Star,
  Cloud,
  MessageCircleQuestion,
  Loader2,
  X,
  Search,
  Filter,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Eyebrow } from '@/components/pulse';

interface TemplateGalleryProps {
  onSelectTemplate: (template: EventTemplate) => void;
  isCreating: boolean;
  creatingTemplateId: string | null;
}

const CATEGORIES = [
  'All',
  'Popular',
  'Favorites',
  'Recently Used',
  'Meetings',
  'Project Management',
  'Business',
  'Education',
  'Workshops',
  'Engineering',
  'HR',
  'Marketing',
  'Sales',
  'Product',
  'Conferences',
  'Events',
  'Brainstorming',
  'Leadership',
  'Research',
  'Healthcare',
  'Community',
  'Fun',
  'Seasonal'
];

function ActivityPreview({ activity }: { activity: any }) {
  if (activity.type === 'poll') {
    return (
      <div className="rounded-md border border-border bg-surface-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-brand" /> Poll
        </div>
        <p className="text-sm font-medium text-foreground">{activity.config.question}</p>
        <div className="space-y-2">
          {activity.config.options.map((opt: any) => (
            <div key={opt.id} className="rounded-md border border-border bg-surface-sunken px-3 py-2 text-sm text-ink-muted">
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (activity.type === 'quiz') {
    return (
      <div className="rounded-md border border-border bg-surface-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ListChecks className="h-4 w-4 text-brand" /> Quiz
        </div>
        {activity.config.questions.map((q: any) => (
          <div key={q.id} className="space-y-3">
            <p className="text-sm font-medium text-foreground">{q.text}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt: any) => {
                const isCorrect = opt.id === q.correctOptionId;
                return (
                  <div 
                    key={opt.id} 
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm text-ink-muted flex items-center justify-between", 
                      isCorrect ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400" : "bg-surface-sunken border-border"
                    )}
                  >
                    {opt.label}
                    {isCorrect && <span className="text-xs font-bold">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (activity.type === 'feedback') {
    return (
      <div className="rounded-md border border-border bg-surface-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Star className="h-4 w-4 text-brand" /> Feedback
        </div>
        <p className="text-sm font-medium text-foreground">{activity.config.prompt}</p>
        <div className="space-y-2">
          {activity.config.fields.map((f: any) => (
            <div key={f.id} className="flex items-center justify-between rounded-md border border-border bg-surface-sunken px-3 py-2 text-sm text-ink-muted">
              <span>{f.label}</span>
              {f.type === 'rating' ? <span className="text-amber-500 tracking-widest text-lg leading-none">★★★★★</span> : <span className="text-xs opacity-60 uppercase tracking-wider font-semibold">Text</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (activity.type === 'wordcloud') {
    return (
      <div className="rounded-md border border-border bg-surface-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Cloud className="h-4 w-4 text-brand" /> Word Cloud
        </div>
        <p className="text-sm font-medium text-foreground">{activity.config.prompt}</p>
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-surface-sunken relative overflow-hidden">
          <span className="absolute text-3xl font-bold text-brand/30 -rotate-12 left-1/4 top-2">Words</span>
          <span className="absolute text-2xl font-bold text-brand/40 rotate-6 right-1/4 bottom-4">Ideas</span>
          <span className="text-4xl font-black text-brand z-10">Cloud</span>
        </div>
      </div>
    );
  }
  return null;
}

export function TemplateGallery({
  onSelectTemplate,
  isCreating,
  creatingTemplateId,
}: TemplateGalleryProps) {
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activityFilter, setActivityFilter] = React.useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = React.useState<EventTemplate | null>(null);

  React.useEffect(() => {
    try {
      const storedFavs = window.localStorage.getItem('iep-template-favorites');
      if (storedFavs) setFavorites(new Set(JSON.parse(storedFavs)));
      const storedRecent = window.localStorage.getItem('iep-template-recent');
      if (storedRecent) setRecentlyUsed(JSON.parse(storedRecent));
    } catch (e) {}
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      window.localStorage.setItem('iep-template-favorites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleCreate = (template: EventTemplate) => {
    setRecentlyUsed(prev => {
      const next = [template.id, ...prev.filter(id => id !== template.id)].slice(0, 10);
      window.localStorage.setItem('iep-template-recent', JSON.stringify(next));
      return next;
    });
    onSelectTemplate(template);
  };

  const filteredTemplates = React.useMemo(() => {
    let filtered = EVENT_TEMPLATES.filter(t => {
      // 1. Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.name.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchTags = t.tags?.some(tag => tag.toLowerCase().includes(q)) ?? false;
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      
      // 2. Category filter
      if (activeCategory === 'Favorites') {
        if (!favorites.has(t.id)) return false;
      } else if (activeCategory === 'Recently Used') {
        if (!recentlyUsed.includes(t.id)) return false;
      } else if (activeCategory === 'Popular') {
         if (!t.featured && t.difficulty !== 'Quick') return false; // Simulated logic for popular
      } else if (activeCategory !== 'All') {
        if (!t.categories?.includes(activeCategory)) return false;
      }
      
      // 3. Activity Type filter
      if (activityFilter !== 'all') {
        if (activityFilter === 'qa') {
           if (!t.settings.allowAnonymousQA) return false;
        } else {
           if (!t.activities.some(act => act.type === activityFilter)) return false;
        }
      }

      return true;
    });

    if (activeCategory === 'Recently Used') {
      filtered.sort((a, b) => recentlyUsed.indexOf(a.id) - recentlyUsed.indexOf(b.id));
    }
    return filtered;
  }, [activeCategory, favorites, recentlyUsed, searchQuery, activityFilter]);

  React.useEffect(() => {
    if (isCreating) {
      // Keep modal open while creating
    }
  }, [isCreating]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Eyebrow>Start quickly</Eyebrow>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Template Gallery
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Choose a pre-built template to instantly generate an event with ready-to-use activities.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-muted" />
              <Input
                type="text"
                placeholder="Search templates, tags..."
                className="pl-9 bg-surface-sunken"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="w-full sm:w-[160px]">
             <Select 
                value={activityFilter} 
                onChange={(e) => setActivityFilter(e.target.value)}
                wrapperClassName="bg-surface-sunken"
             >
                <option value="all">All Activities</option>
                <option value="poll">Polls</option>
                <option value="quiz">Quizzes</option>
                <option value="wordcloud">Word Clouds</option>
                <option value="feedback">Feedback</option>
                <option value="qa">Q&A Board</option>
             </Select>
           </div>
        </div>
      </div>

      <div className="flex w-full overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            const isFav = category === 'Favorites';
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-surface-sunken text-ink-muted hover:bg-surface-card hover:text-foreground border border-border"
                )}
              >
                {isFav && <Star className={cn("mr-1.5 h-3.5 w-3.5", isActive ? "fill-background" : "fill-transparent")} />}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-ink-muted mb-4">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No templates found</h3>
          <p className="text-sm text-ink-muted mt-1 max-w-sm">
            {activeCategory === 'Favorites' 
              ? "You haven't favorited any templates yet. Click the star icon on any template to add it here."
              : activeCategory === 'Recently Used'
              ? "You haven't used any templates yet. Templates you create events from will appear here."
              : "Try adjusting your search or filter to find what you're looking for."}
          </p>
          {(activeCategory !== 'All' || searchQuery !== '' || activityFilter !== 'all') && (
            <Button variant="outline" className="mt-6" onClick={() => { setActiveCategory('All'); setSearchQuery(''); setActivityFilter('all'); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const isFav = favorites.has(template.id);
            
            const activityTypes = new Map<string, { label: string, icon: React.ElementType }>();
            template.activities.forEach((act) => {
              if (act.type === 'poll') activityTypes.set('poll', { label: 'Poll', icon: BarChart3 });
              if (act.type === 'quiz') activityTypes.set('quiz', { label: 'Quiz', icon: ListChecks });
              if (act.type === 'wordcloud') activityTypes.set('wordcloud', { label: 'Word Cloud', icon: Cloud });
              if (act.type === 'feedback') activityTypes.set('feedback', { label: 'Feedback', icon: Star });
            });
            if (template.settings.allowAnonymousQA) {
              activityTypes.set('qa', { label: 'Q&A', icon: MessageCircleQuestion });
            }
            const activitiesList = Array.from(activityTypes.values());

            return (
              <Card
                key={template.id}
                role="button"
                tabIndex={0}
                onClick={() => setPreviewTemplate(template)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewTemplate(template);
                  }
                }}
                className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div className="absolute right-3 top-3 z-10">
                  <button
                    onClick={(e) => toggleFavorite(e, template.id)}
                    className="p-2 rounded-full bg-surface-card/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={cn("h-4 w-4", isFav ? "fill-amber-400 text-amber-400" : "text-ink-muted")} />
                  </button>
                </div>
                {isFav && (
                  <div className="absolute right-3 top-3 z-0 group-hover:hidden">
                     <div className="p-2">
                       <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                     </div>
                  </div>
                )}

                <CardHeader className="pb-4 relative">
                  <div className="mb-2 flex items-center justify-between">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-subtle text-brand transition-transform duration-300 ease-out group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                     </div>
                     {template.difficulty && (
                        <div className="rounded-full border border-border bg-surface-sunken px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                           {template.difficulty}
                        </div>
                     )}
                  </div>
                  <CardTitle className="text-lg pr-8">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">Estimated setup</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {template.estimatedDuration}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">Best for</span>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {template.recommendedAudience}
                        </div>
                      </div>
                    </div>
                    
                    {activitiesList.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <LayoutTemplate className="h-3.5 w-3.5 text-brand" />
                          Activities included
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activitiesList.map((activity) => {
                            const ActivityIcon = activity.icon;
                            return (
                              <div 
                                key={activity.label}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-sunken px-2 py-1 text-[11px] font-medium text-foreground"
                              >
                                <ActivityIcon className="h-3 w-3 text-ink-muted" />
                                {activity.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                         {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-muted bg-surface-sunken px-1.5 py-0.5 rounded border border-border">
                               <Tag className="h-2.5 w-2.5" />
                               {tag}
                            </span>
                         ))}
                         {template.tags.length > 3 && (
                            <span className="inline-flex items-center text-[10px] font-medium text-ink-muted px-1">
                               +{template.tags.length - 3} more
                            </span>
                         )}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 text-sm font-semibold text-brand flex items-center justify-between opacity-0 transition-all duration-300 ease-out group-hover:opacity-100">
                    <span className="group-hover:underline">Preview template</span>
                    <span className="-translate-x-2 transition-transform duration-300 ease-out group-hover:translate-x-0">→</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && !isCreating && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl gap-0 p-0 overflow-hidden sm:rounded-xl flex flex-col max-h-[85vh]">
          {previewTemplate && (
            <>
              <div className="bg-surface-sunken p-6 sm:p-8 border-b border-border shrink-0">
                <div className="flex items-start justify-between">
                   <div className="flex items-start gap-4">
                     <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                       <previewTemplate.icon className="h-8 w-8" />
                     </div>
                     <div className="space-y-1.5 pt-1">
                       <DialogTitle className="text-2xl flex items-center gap-2">
                         {previewTemplate.name}
                         {previewTemplate.difficulty && (
                           <span className="rounded-full border border-border bg-surface-card px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted align-middle">
                             {previewTemplate.difficulty}
                           </span>
                         )}
                       </DialogTitle>
                       <DialogDescription className="text-base max-w-2xl">{previewTemplate.description}</DialogDescription>
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-border bg-surface-card p-6 sm:p-8 space-y-8">
                   <div className="space-y-4">
                     <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Overview</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-ink-muted flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</span>
                          <span className="text-sm font-medium text-foreground">{previewTemplate.estimatedDuration}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-ink-muted flex items-center gap-1"><Users className="h-3 w-3" /> Audience</span>
                          <span className="text-sm font-medium text-foreground">{previewTemplate.recommendedAudience}</span>
                        </div>
                     </div>
                   </div>

                   {previewTemplate.objectives && previewTemplate.objectives.length > 0 && (
                      <div className="space-y-3">
                         <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Objectives</h3>
                         <ul className="space-y-2">
                            {previewTemplate.objectives.map((obj, i) => (
                               <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                                  {obj}
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}

                   {previewTemplate.expectedOutcomes && previewTemplate.expectedOutcomes.length > 0 && (
                      <div className="space-y-3">
                         <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Expected Outcomes</h3>
                         <ul className="space-y-2">
                            {previewTemplate.expectedOutcomes.map((out, i) => (
                               <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-green-500 font-bold shrink-0">✓</span>
                                  {out}
                               </li>
                            ))}
                         </ul>
                      </div>
                   )}

                   {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                      <div className="space-y-3">
                         <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Tags</h3>
                         <div className="flex flex-wrap gap-1.5">
                            {previewTemplate.tags.map(tag => (
                               <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-surface-sunken border border-border text-xs font-medium text-ink-muted">
                                  {tag}
                               </span>
                            ))}
                         </div>
                      </div>
                   )}
                </div>

                <div className="w-full md:w-3/5 p-6 sm:p-8 space-y-8 bg-background">
                   {previewTemplate.suggestedFlow && previewTemplate.suggestedFlow.length > 0 && (
                      <div className="space-y-4">
                         <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                            Suggested Event Flow
                         </h3>
                         <div className="space-y-3">
                            {previewTemplate.suggestedFlow.map((flow, i) => (
                               <div key={i} className="flex gap-4">
                                  <div className="w-20 shrink-0 text-xs font-medium text-brand mt-0.5">{flow.time}</div>
                                  <div className="text-sm text-foreground">{flow.description}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}

                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <h3 className="font-semibold text-lg text-foreground">Activities included</h3>
                       <span className="text-xs font-semibold bg-surface-sunken px-2 py-1 rounded-md text-ink-muted border border-border">
                         {previewTemplate.activities.length} included
                       </span>
                     </div>
                     
                     {previewTemplate.activities.length === 0 ? (
                       <div className="rounded-lg border border-dashed border-border p-8 text-center text-ink-muted text-sm">
                         This template only configures event settings (like Q&A) and doesn&apos;t contain any predefined activities.
                       </div>
                     ) : (
                       <div className="space-y-4">
                         {previewTemplate.activities.map((activity, idx) => (
                           <ActivityPreview key={idx} activity={activity} />
                         ))}
                       </div>
                     )}

                     {previewTemplate.settings.allowAnonymousQA && (
                       <div className="rounded-md border border-border bg-surface-card p-4 space-y-3">
                         <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                           <MessageCircleQuestion className="h-4 w-4 text-brand" /> Q&A Board
                         </div>
                         <p className="text-sm text-ink-muted">A live Q&A board will be enabled for this event, allowing participants to ask and upvote questions.</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              <div className="border-t border-border bg-surface-card p-4 sm:px-8 sm:py-4 flex items-center justify-end gap-3 shrink-0">
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewTemplate(null)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleCreate(previewTemplate)}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating event...
                    </>
                  ) : (
                    'Use this template'
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
