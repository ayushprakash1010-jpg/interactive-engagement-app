import * as React from 'react';
import { Button, Badge } from '@/components/ui';
import { ChevronRight, Save, Copy, Trash2, History, Download, Circle } from 'lucide-react';
import Link from 'next/link';

interface AIWorkspaceHeaderProps {
  title?: string;
  status?: string;
  lastSaved?: string;
  onExport?: () => void;
  isExporting?: boolean;
}

export function AIWorkspaceHeader({
  title = 'Untitled Workspace',
  status = 'Draft',
  lastSaved = 'Just now',
  onExport,
  isExporting,
}: AIWorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b pb-4 mb-6 pt-2">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">AI Studio</span>
      </nav>

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {title}
            <Badge variant="neutral" className="font-normal px-2.5 py-0.5">
              <Circle className="h-2 w-2 mr-1.5 fill-current text-blue-500" />
              {status}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last saved: {lastSaved}
          </p>
        </div>

        {/* Workspace Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button variant="outline" size="sm" className="hidden lg:flex">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:flex">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" className="hidden lg:flex text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Workspace
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport} 
            disabled={!onExport || isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>
    </header>
  );
}
