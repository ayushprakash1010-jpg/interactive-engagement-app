import * as React from 'react';
import { Button } from '@/components/ui';
import { LayoutDashboard, CheckSquare, MessageSquare, Star, Clock, FolderHeart } from 'lucide-react';

interface LibrarySidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function LibrarySidebar({ activeTab, onTabChange }: LibrarySidebarProps) {
  const categories = [
    { id: 'sessions', label: 'Session Templates', icon: LayoutDashboard },
    { id: 'activities', label: 'Activity Templates', icon: CheckSquare },
    { id: 'presets', label: 'Prompt Presets', icon: MessageSquare },
  ];

  const collections = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recently Used', icon: Clock },
    { id: 'org', label: 'Org Templates', icon: FolderHeart },
  ];

  return (
    <div className="w-48 shrink-0 border-r flex flex-col p-4 bg-muted/10">
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Library</h3>
        <div className="space-y-1">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeTab === cat.id ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => onTabChange(cat.id)}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Collections</h3>
        <div className="space-y-1">
          {collections.map(col => (
            <Button
              key={col.id}
              variant={activeTab === col.id ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => onTabChange(col.id)}
            >
              <col.icon className="h-4 w-4" />
              {col.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
