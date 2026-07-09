import * as React from 'react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchToolbar({ searchQuery, onSearchChange }: SearchToolbarProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-10 h-10 w-full bg-background border-border" 
          placeholder="Search templates, activities, and prompts..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" className="gap-2 h-10">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>
    </div>
  );
}
