'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  Cloud,
  FileText,
  FolderOpen,
  Globe,
  HelpCircle,
  Keyboard,
  LayoutDashboard,
  Monitor,
  Moon,
  Plus,
  RadioTower,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
  ClipboardList,
  LogOut,
  CircleUserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import {
  closeCommandPalette,
  recordRecentCommand,
  toggleFavoriteCommand,
  setCommandPaletteOpen,
  useCommandPalette,
} from '@/lib/command-palette-store';
import { requestOpenNotificationCenter } from '@/lib/notification-center-store';
import { useEvents } from '@/lib/use-events';
import { EVENT_TEMPLATES } from '@/lib/templates';
import { Star } from 'lucide-react';



function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  
  // Simple regex to split text by query (case-insensitive)
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} className="text-brand font-bold">{part}</span> : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CommandGroup =
  | 'Events'
  | 'Templates'
  | 'Navigation'
  | 'Actions'
  | 'AI'
  | 'Appearance'
  | 'Account'
  | 'Settings'
  | 'Utilities';

export type CommandItem = {
  id: string;
  title: string;
  description: string;
  group: CommandGroup;
  icon: React.ElementType;
  shortcut?: string[];
  /** badge to show (e.g. "Soon") */
  badge?: string;
  /** text to show on the far right (e.g. "Event", "Template") */
  typeLabel?: string;
  /** secondary text on the far right (e.g. "Yesterday", "5 activities") */
  metaLabel?: string;
  /** if true, the command is non-actionable (coming soon) */
  disabled?: boolean;
  action: () => void;
};

// ---------------------------------------------------------------------------
// Command definitions
// ---------------------------------------------------------------------------

function buildCommands(
  router: ReturnType<typeof useRouter>,
  setTheme: (t: 'light' | 'dark' | 'system') => void,
  events: any[] = [],
): CommandItem[] {
  const eventCommands = events.map(event => ({
    id: `event-${event._id}`,
    title: event.name,
    description: 'Interactive session',
    typeLabel: 'Event',
    metaLabel: new Date(event.createdAt).toLocaleDateString(),
    group: 'Events' as CommandGroup,
    icon: CalendarDays,
    action: () => {
      closeCommandPalette();
      router.push(`/dashboard/events/${event._id}`);
    }
  }));

  const templateCommands = EVENT_TEMPLATES.map(t => ({
    id: `template-${t.id}`,
    title: t.name,
    description: t.description,
    typeLabel: 'Template',
    metaLabel: `${t.activities.length} activities`,
    group: 'Templates' as CommandGroup,
    icon: t.icon,
    action: () => {
      closeCommandPalette();
      router.push(`/dashboard/events/new?templateId=${t.id}`);
    }
  }));

  const nav = (href: string) => () => {
    closeCommandPalette();
    router.push(href);
  };

  return [
    ...eventCommands,
    ...templateCommands,
    // ── Navigation ──────────────────────────────────────────────────────────
    {
      id: 'nav-dashboard',
      typeLabel: 'Action',
      title: 'Dashboard',
      description: 'Go to your event workspace',
      group: 'Navigation',
      icon: LayoutDashboard,
      shortcut: ['G', 'D'],
      action: nav('/dashboard'),
    },
    {
      id: 'nav-events',
      title: 'Events',
      description: 'Browse and manage your events',
      group: 'Navigation',
      icon: CalendarDays,
      shortcut: ['G', 'E'],
      action: nav('/dashboard'),
    },
    {
      id: 'nav-ai-studio',
      title: 'AI Studio',
      description: 'Create and manage AI-powered activities',
      group: 'Navigation',
      icon: Sparkles,
      shortcut: ['G', 'A'],
      action: nav('/dashboard/ai'),
    },
    {
      id: 'nav-settings',
      typeLabel: 'Settings',
      title: 'Settings',
      description: 'Manage your account and preferences',
      group: 'Navigation',
      icon: Settings,
      shortcut: ['G', 'S'],
      action: nav('/dashboard/settings'),
    },
    {
      id: 'nav-account',
      title: 'Account',
      description: 'Manage your profile and subscription',
      group: 'Account',
      icon: CircleUserRound,
      shortcut: ['G', 'C'],
      action: nav('/dashboard/account'),
    },
    {
      id: 'nav-help',
      title: 'Help Center',
      description: 'Browse documentation and support articles',
      group: 'Navigation',
      icon: HelpCircle,
      shortcut: ['G', 'H'],
      action: nav('/dashboard/help'),
    },
    {
      id: 'nav-landing',
      title: 'Landing Page',
      description: 'View the Pulse marketing homepage',
      group: 'Navigation',
      icon: Globe,
      action: nav('/'),
    },

    // ── Event Actions ────────────────────────────────────────────────────────
    {
      id: 'event-create',
      typeLabel: 'Action',
      title: 'Create Event',
      description: 'Start a new interactive event',
      group: 'Actions',
      icon: Plus,
      shortcut: ['C', 'E'],
      action: nav('/dashboard/events/new'),
    },
    {
      id: 'event-browse',
      title: 'Browse Events',
      description: 'View all your events and sessions',
      group: 'Actions',
      icon: FolderOpen,
      action: nav('/dashboard'),
    },

    // ── AI ───────────────────────────────────────────────────────────────────
    {
      id: 'ai-studio',
      typeLabel: 'Action',
      title: 'Open AI Studio',
      description: 'Generate activities with the Pulse AI',
      group: 'AI',
      icon: Sparkles,
      action: nav('/dashboard/ai'),
    },
    {
      id: 'ai-generate-poll',
      title: 'Generate Poll',
      description: 'Use AI to create an interactive poll',
      group: 'AI',
      icon: RadioTower,
      action: nav('/dashboard/ai'),
    },
    {
      id: 'ai-generate-quiz',
      title: 'Generate Quiz',
      description: 'Use AI to build a scored quiz',
      group: 'AI',
      icon: BrainCircuit,
      action: nav('/dashboard/ai'),
    },
    {
      id: 'ai-generate-feedback',
      title: 'Generate Feedback Form',
      description: 'Use AI to draft a feedback survey',
      group: 'AI',
      icon: FileText,
      action: nav('/dashboard/ai'),
    },
    {
      id: 'ai-generate-wordcloud',
      title: 'Generate Word Cloud',
      description: 'Use AI to create a word cloud prompt',
      group: 'AI',
      icon: Cloud,
      action: nav('/dashboard/ai'),
    },
    {
      id: 'ai-generate-survey',
      title: 'Generate Survey',
      description: 'Use AI to draft a comprehensive survey',
      group: 'AI',
      icon: ClipboardList,
      action: nav('/dashboard/ai'),
    },
    {
      id: 'ai-summary',
      typeLabel: 'Analytics',
      shortcut: ['Cmd', 'A'],
      title: 'AI Summary',
      description: 'View AI-generated session summaries',
      group: 'AI',
      icon: Sparkles,
      action: nav('/dashboard/ai'),
    },

    // ── Appearance ───────────────────────────────────────────────────────────
    {
      id: 'theme-light',
      title: 'Light Theme',
      description: 'Switch to light appearance',
      group: 'Appearance',
      icon: Sun,
      action: () => {
        setTheme('light');
        closeCommandPalette();
      },
    },
    {
      id: 'theme-dark',
      title: 'Dark Theme',
      description: 'Switch to dark appearance',
      group: 'Appearance',
      icon: Moon,
      action: () => {
        setTheme('dark');
        closeCommandPalette();
      },
    },
    {
      id: 'theme-system',
      title: 'System Theme',
      description: 'Follow your OS color scheme preference',
      group: 'Appearance',
      icon: Monitor,
      action: () => {
        setTheme('system');
        closeCommandPalette();
      },
    },

    // ── Account ─────────────────────────────────────────────────────────────
    {
      id: 'auth-logout',
      title: 'Log out',
      description: 'Sign out of your Pulse account',
      group: 'Account',
      icon: LogOut,
      action: () => {
        closeCommandPalette();
        window.location.href = '/api/auth/logout';
      },
    },

    // ── Utilities ────────────────────────────────────────────────────────────
    {
      id: 'util-notifications',
      title: 'Open Notification Center',
      description: 'View AI, event, and analytics updates',
      group: 'Utilities',
      icon: Bell,
      action: () => {
        closeCommandPalette();
        // Use a tiny timeout so the palette finishes closing before the
        // notification center opens (avoids two overlays fighting each other).
        window.setTimeout(() => requestOpenNotificationCenter(), 80);
      },
    },
    {
      id: 'util-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all available keyboard shortcuts',
      group: 'Utilities',
      icon: Keyboard,
      shortcut: ['?'],
      action: () => {
        // Palette itself IS the keyboard shortcuts reference — no separate page.
        // We just close it (user can re-open to see shortcuts in the list).
        closeCommandPalette();
      },
    },
    {
      id: 'util-profile',
      title: 'Profile',
      description: 'View and edit your profile',
      group: 'Utilities',
      icon: User,
      badge: 'Soon',
      disabled: true,
      action: () => {/* coming soon */},
    },
    {
      id: 'util-session-history',
      title: 'Session History',
      description: 'Browse past engagement sessions',
      group: 'Utilities',
      icon: CalendarDays,
      badge: 'Soon',
      disabled: true,
      action: () => {/* coming soon */},
    },
  ];
}

// ---------------------------------------------------------------------------
// Fuzzy search
// ---------------------------------------------------------------------------

function fuzzyMatch(item: CommandItem, rawQuery: string): boolean {
  if (!rawQuery.trim()) return true;

  const query = rawQuery.toLowerCase().trim();
  const tokens = query.split(/\s+/);

  const haystack = [item.title, item.description, item.group]
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

// ---------------------------------------------------------------------------
// Group ordering
// ---------------------------------------------------------------------------

const GROUP_ORDER: CommandGroup[] = [
  'Actions',
  'Events',
  'Templates',
  'Navigation',
  'AI',
  'Account',
  'Settings',
  'Appearance',
  'Utilities',
];

function groupIcon(group: CommandGroup): React.ElementType {
  switch (group) {
    case 'Events': return CalendarDays;
    case 'Templates': return LayoutDashboard;
    case 'Actions': return Plus;
    case 'Navigation': return Globe;
    case 'AI': return Sparkles;
    case 'Account': return User;
    case 'Settings': return Settings;
    case 'Appearance': return Sun;
    case 'Utilities': return Settings;
    default: return Settings;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KbdBadge({ keys }: { keys: string[] }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-sunken px-1 font-mono text-2xs font-medium text-ink-muted shadow-xs"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

function CommandRow({
  item,
  isHighlighted,
  isFavorite,
  onSelect,
  onMouseEnter,
  onToggleFavorite,
}: {
  item: CommandItem;
  isHighlighted: boolean;
  isFavorite?: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onToggleFavorite?: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      id={`cmd-item-${item.id}`}
      role="option"
      aria-selected={isHighlighted}
      aria-disabled={item.disabled}
      disabled={item.disabled}
      className={cn(
        'group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-fast ease-standard',
        'focus-visible:outline-none',
        isHighlighted
          ? 'bg-brand-subtle text-brand-subtle-text'
          : 'text-ink-secondary hover:bg-surface-sunken hover:text-foreground',
        item.disabled && 'cursor-not-allowed opacity-50',
      )}
      onClick={item.disabled ? undefined : onSelect}
      onMouseEnter={onMouseEnter}
    >
      {/* Icon */}
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
          isHighlighted
            ? 'bg-brand/15 text-brand'
            : item.group === 'AI'
            ? 'bg-ai-subtle text-ai'
            : 'bg-surface-sunken text-ink-muted',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      {/* Text */}
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="block truncate text-sm font-semibold leading-tight text-foreground">
              <HighlightedText text={item.title} query={(document.getElementById('cmd-palette-input') as HTMLInputElement)?.value || ''} />
            </span>
            {item.badge && (
              <span className="shrink-0 rounded-full bg-surface-sunken px-1.5 py-0.5 text-2xs font-semibold text-ink-muted">
                {item.badge}
              </span>
            )}
          </span>
          
          {(item.typeLabel || item.metaLabel) && (
             <span className="flex items-center gap-2 shrink-0 text-xs text-ink-faint">
               {item.typeLabel && <span className="font-medium text-ink-muted">{item.typeLabel}</span>}
               {item.typeLabel && item.metaLabel && <span>•</span>}
               {item.metaLabel && <span>{item.metaLabel}</span>}
             </span>
          )}
        </span>
        <span className="block truncate text-xs text-ink-muted mt-0.5">
          {item.description}
        </span>
      </span>

      {/* Shortcut */}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={cn('ml-2 p-1.5 rounded-md hover:bg-surface-card transition-opacity',
            isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          )}
        >
          <Star className={cn('h-4 w-4', isFavorite ? 'fill-amber-400 text-amber-400' : 'text-ink-muted')} />
        </button>
      )}

      {item.shortcut && <KbdBadge keys={item.shortcut} />}
    </button>
  );
}

function GroupHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-1 pt-3 first:pt-0">
      <Icon className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
      <span className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TABS = ['All', 'Events', 'Templates', 'Actions'];

export function CommandPalette() {
  const { open, recentCommands, favoriteCommands } = useCommandPalette();
  const router = useRouter();
  const { setTheme } = useTheme();
  
  const { data: events } = useEvents();

  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<string>(TABS[0] as string);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Build the command list (memoised so it only rebuilds when deps change)
  const allCommands = React.useMemo(
    () => buildCommands(router, setTheme, events || []),
    [router, setTheme, events],
  );

  // Filter by query and tab
  const filteredCommands = React.useMemo(() => {
    let filtered = allCommands.filter((cmd) => fuzzyMatch(cmd, query));
    if (activeTab !== 'All') {
      if (activeTab === 'Events') filtered = filtered.filter(c => c.group === 'Events');
      if (activeTab === 'Templates') filtered = filtered.filter(c => c.group === 'Templates');
      if (activeTab === 'Actions') filtered = filtered.filter(c => c.group === 'Actions' || c.group === 'AI');
    }
    
    // Remove favorites from normal filtered results so they can be shown in their own section
    if (!query.trim()) {
      filtered = filtered.filter(c => !favoriteCommands.includes(c.id));
    }
    return filtered;
  }, [allCommands, query, activeTab, favoriteCommands]);
  
  // Resolve favorites
  const resolvedFavorites = React.useMemo(() => {
    if (query.trim() || activeTab !== 'All') return [];
    return favoriteCommands
      .map(id => allCommands.find(c => c.id === id))
      .filter((c): c is CommandItem => !!c);
  }, [query, activeTab, favoriteCommands, allCommands]);

  // Build grouped view
  const groupedCommands = React.useMemo(() => {
    const map = new Map<CommandGroup, CommandItem[]>();
    for (const group of GROUP_ORDER) {
      const items = filteredCommands.filter((c) => c.group === group);
      if (items.length > 0) map.set(group, items);
    }
    return map;
  }, [filteredCommands]);

  // Flat ordered list for keyboard navigation
  const flatList = React.useMemo(
    () => GROUP_ORDER.flatMap((g) => groupedCommands.get(g) ?? []),
    [groupedCommands],
  );

  // Recent commands (resolved to full command objects)
  const resolvedRecent = React.useMemo(() => {
    if (query.trim() || activeTab !== 'All') return []; 
    return recentCommands
      .map((r) => allCommands.find((c) => c.id === r.id))
      .filter((c): c is CommandItem => !!c && !favoriteCommands.includes(c.id))
      .slice(0, 5);
  }, [query, activeTab, recentCommands, allCommands, favoriteCommands]);

  // Combined list for keyboard navigation: recent first (when visible), then filtered
  const navList = React.useMemo(() => {
    if (query.trim() || activeTab !== 'All') return flatList;
    return [...resolvedFavorites, ...resolvedRecent, ...flatList];
  }, [resolvedFavorites, resolvedRecent, flatList, query, activeTab]);

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightedIndex(0);
      setActiveTab('All');
      // Defer focus so Radix has time to mount the dialog
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Reset highlight when list changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query, activeTab]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    const el = document.getElementById(`cmd-item-${navList[highlightedIndex]?.id ?? ''}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, navList]);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        // Don't open if user is typing in an input/textarea/contenteditable
        // (unless the palette is already open and they're in our search input)
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const isEditing =
          tagName === 'input' ||
          tagName === 'textarea' ||
          target.isContentEditable;

        if (isEditing && !open) return;

        e.preventDefault();
        setCommandPaletteOpen(!open);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setActiveTab(prev => {
        const idx = TABS.indexOf(prev);
        const nextIdx = e.shiftKey ? (idx - 1 + TABS.length) % TABS.length : (idx + 1) % TABS.length;
        return TABS[nextIdx] as string;
      });
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((i) => {
          const next = i + 1;
          // Skip disabled items
          for (let j = next; j < navList.length; j++) {
            if (!navList[j]?.disabled) return j;
          }
          return i;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((i) => {
          const prev = i - 1;
          for (let j = prev; j >= 0; j--) {
            if (!navList[j]?.disabled) return j;
          }
          return i;
        });
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const item = navList[highlightedIndex];
        if (item && !item.disabled) {
          executeCommand(item);
        }
        break;
      }
    }
  };

  const executeCommand = (item: CommandItem) => {
    if (item.disabled) return;
    recordRecentCommand({ id: item.id, title: item.title, group: item.group });
    item.action();
  };

  const isEmpty = flatList.length === 0 && query.trim().length > 0;
  const showRecent = resolvedRecent.length > 0 && !query.trim();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setCommandPaletteOpen}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'duration-base ease-standard',
          )}
        />

        {/* Panel */}
        <DialogPrimitive.Content
          aria-label="Command palette"
          onKeyDown={handleKeyDown}
          className={cn(
            'fixed left-[50%] top-[12%] z-50',
            'w-full max-w-[580px] translate-x-[-50%]',
            'flex flex-col overflow-hidden rounded-xl border border-border bg-surface-card shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]',
            'duration-base ease-standard',
            'max-h-[70vh]',
          )}
        >
          {/* Search header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <DialogPrimitive.Title className="sr-only">
              Command Palette
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Search for commands, navigate to pages, switch themes, and more.
            </DialogPrimitive.Description>
            <input
              ref={inputRef}
              id="cmd-palette-input"
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls="cmd-palette-list"
              aria-activedescendant={
                navList[highlightedIndex]
                  ? `cmd-item-${navList[highlightedIndex]!.id}`
                  : undefined
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands…"
              className={cn(
                'min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none',
                'placeholder:text-ink-muted',
              )}
              spellCheck={false}
              autoComplete="off"
            />
            {/* Shortcut hint */}
            <KbdBadge keys={['Esc']} />
            <DialogPrimitive.Close
              className="rounded-sm text-ink-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close command palette"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>


          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border px-4 py-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeTab === tab ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground hover:bg-surface-sunken"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results */}
          <div
            ref={listRef}
            id="cmd-palette-list"
            role="listbox"
            aria-label="Commands"
            className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-color:var(--border-default)_transparent] [scrollbar-width:thin]"
          >
            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-ink-muted">
                  <Search className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    No matching commands
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Try a different search term
                  </p>
                </div>
              </div>
            )}

            {/* Favorites */}
            {resolvedFavorites.length > 0 && (
              <section aria-label="Favorites">
                <GroupHeader label="Favorites" icon={Star} />
                {resolvedFavorites.map((item, idx) => (
                  <CommandRow
                    key={item.id}
                    item={item}
                    isHighlighted={highlightedIndex === idx}
                    onSelect={() => executeCommand(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    isFavorite={favoriteCommands.includes(item.id)}
                    onToggleFavorite={() => toggleFavoriteCommand(item.id)}
                  />
                ))}
                {(resolvedRecent.length > 0 || flatList.length > 0) && (
                  <div className="mx-3 my-2 border-t border-border" />
                )}
              </section>
            )}

            {/* Recent commands */}
            {showRecent && (
              <section aria-label="Recent commands">
                <GroupHeader label="Recent" icon={CalendarDays} />
                {resolvedRecent.map((item, idx) => {
                  const navIdx = resolvedFavorites.length + idx;
                  return (
                    <CommandRow
                      key={item.id}
                      item={item}
                      isHighlighted={highlightedIndex === navIdx}
                      onSelect={() => executeCommand(item)}
                      onMouseEnter={() => setHighlightedIndex(navIdx)}
                      isFavorite={favoriteCommands.includes(item.id)}
                      onToggleFavorite={() => toggleFavoriteCommand(item.id)}
                    />
                  );
                })}

                {/* Divider before grouped commands */}
                {flatList.length > 0 && (
                  <div className="mx-3 my-2 border-t border-border" />
                )}
              </section>
            )}

            {/* Grouped commands (when query is empty, show all groups; when searching, show filtered) */}
            {!isEmpty && (
              <div aria-label="All commands">
                {GROUP_ORDER.map((group) => {
                  const items = groupedCommands.get(group);
                  if (!items || items.length === 0) return null;

                  const Icon = groupIcon(group);

                  // Offset for keyboard nav
                  const groupOffset = (query.trim() || activeTab !== 'All')
                    ? 0
                    : resolvedFavorites.length + resolvedRecent.length;

                  return (
                    <section key={group} aria-label={group}>
                      <GroupHeader label={group} icon={Icon} />
                      {items.map((item) => {
                        const flatIdx = flatList.indexOf(item);
                        const navIdx = flatIdx + groupOffset;

                        return (
                          <CommandRow
                            key={item.id}
                            item={item}
                            isHighlighted={highlightedIndex === navIdx}
                            onSelect={() => executeCommand(item)}
                            onMouseEnter={() => setHighlightedIndex(navIdx)}
                            isFavorite={favoriteCommands.includes(item.id)}
                            onToggleFavorite={() => toggleFavoriteCommand(item.id)}
                          />
                        );
                      })}
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer — keyboard shortcut hints */}
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-2">
            <div className="flex items-center gap-3 text-2xs text-ink-faint">
              <span className="flex items-center gap-1">
                <KbdBadge keys={['↑']} />
                <KbdBadge keys={['↓']} />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <KbdBadge keys={['↵']} />
                Select
              </span>
            </div>
            <span className="text-2xs text-ink-faint">
              <KbdBadge keys={['Ctrl', 'K']} />
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
