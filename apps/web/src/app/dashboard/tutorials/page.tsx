'use client';

import * as React from 'react';
import { Search, PlayCircle, Filter } from 'lucide-react';
import {
  EmptyState,
  PageHeader,
  VideoPlayer,
  VideoModal,
  useVideoModal,
} from '@/components/ui';
import {
  TUTORIAL_VIDEOS,
  TUTORIAL_CATEGORY_LABELS,
  type TutorialCategory,
} from '@/lib/tutorial-videos';
import { cn } from '@/lib/utils';

const ALL_CATEGORIES = Object.keys(TUTORIAL_CATEGORY_LABELS) as TutorialCategory[];

export default function TutorialsPage() {
  const { activeVideo, openVideo, closeVideo } = useVideoModal();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<TutorialCategory | 'all'>('all');

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return TUTORIAL_VIDEOS.filter((v) => {
      const matchesCategory =
        activeCategory === 'all' || v.category === activeCategory;
      const matchesSearch =
        !query ||
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        (v.feature ?? '').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Learn Pulse"
        title="Tutorial Videos"
        description="Step-by-step video guides for every Pulse feature — from your first event to advanced AI workflows."
      />

      {/* Search + Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            placeholder="Search tutorials…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-surface-card pl-9 pr-3 text-sm text-foreground placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="Search tutorials"
          />
        </div>

        {/* Results count */}
        <p className="shrink-0 text-sm text-ink-muted">
          {filtered.length} {filtered.length === 1 ? 'tutorial' : 'tutorials'}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-all',
            activeCategory === 'all'
              ? 'border-brand bg-brand text-brand-foreground shadow-sm'
              : 'border-border bg-surface-card text-ink-secondary hover:border-brand/30 hover:bg-surface-raised hover:text-foreground',
          )}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              activeCategory === cat
                ? 'border-brand bg-brand text-brand-foreground shadow-sm'
                : 'border-border bg-surface-card text-ink-secondary hover:border-brand/30 hover:bg-surface-raised hover:text-foreground',
            )}
          >
            {TUTORIAL_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <VideoPlayer
              key={video.id}
              video={video}
              variant="card"
              onPlay={openVideo}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PlayCircle className="h-6 w-6" />}
          title="No tutorials found"
          description={
            search
              ? `No tutorials match "${search}". Try a different search term or clear filters.`
              : 'No tutorials in this category yet. Check back soon!'
          }
        />
      )}

      {/* Video modal */}
      <VideoModal video={activeVideo} onClose={closeVideo} />
    </div>
  );
}
