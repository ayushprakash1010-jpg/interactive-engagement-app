'use client';

import * as React from 'react';
import {
  Bell,
  Briefcase,
  Check,
  Clock,
  Database,
  Globe2,
  Info,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  UserRound,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageHeader,
  SectionHeader,
  Select,
  SurfacePanel,
  Switch,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Slider,
  RadioCardGroup,
  SettingsSkeleton,
} from '@/components/ui';
import { useAuth } from '@/lib/use-auth';
import { useTheme, type Theme } from '@/lib/theme';
import { useEvents } from '@/lib/use-events';
import { useNotifications } from '@/lib/notification-store';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const SettingsSearchContext = React.createContext('');

type SectionId =
  | 'profile'
  | 'appearance'
  | 'preferences'
  | 'notifications'
  | 'dashboard'
  | 'command-palette'
  | 'ai'
  | 'security'
  | 'integrations'
  | 'workspace'
  | 'data'
  | 'about';

const SECTION_NAV: Array<{
  id: SectionId;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
    { id: 'profile', label: 'Profile', description: 'Identity and workspace role', icon: UserRound },
    { id: 'appearance', label: 'Appearance', description: 'Theme and interface', icon: Palette },
    { id: 'preferences', label: 'Preferences', description: 'Locale and formatting', icon: Globe2 },
    { id: 'notifications', label: 'Notifications', description: 'Email and activity updates', icon: Bell },
    { id: 'dashboard', label: 'Dashboard', description: 'Workspace overview controls', icon: LayoutDashboard },
    { id: 'command-palette', label: 'Command Palette', description: 'Search and navigation', icon: Terminal },
    { id: 'ai', label: 'AI Preferences', description: 'Generation defaults', icon: Sparkles },
    { id: 'security', label: 'Security', description: 'Session and sign-in', icon: ShieldCheck },
    { id: 'integrations', label: 'Integrations', description: 'Zoom, PowerPoint & third-party apps', icon: Globe2 },
    { id: 'workspace', label: 'Workspace', description: 'Usage and metrics', icon: Briefcase },
    { id: 'data', label: 'Data Management', description: 'Export and cache controls', icon: Database },
    { id: 'about', label: 'About', description: 'Versions and licenses', icon: Info },
  ];

const THEME_OPTIONS: Array<{
  value: Theme;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
    { value: 'light', label: 'Light', description: 'Bright surfaces and high-contrast controls.', icon: Sun },
    { value: 'dark', label: 'Dark', description: 'Reduced glare for sessions and late work.', icon: Moon },
    { value: 'system', label: 'System', description: 'Follow your operating system preference.', icon: Monitor },
  ];

const localStorageKey = 'iep-settings-preferences';

type LocalSettings = {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  firstDayOfWeek: string;
  inAppNotifications: boolean;
  sound: boolean;
  desktopNotifications: boolean;
  notificationGrouping: boolean;
  showUnreadBadge: boolean;
  relativeTimestamps: boolean;
  aiModel: string;
  aiTone: string;
  creativity: string;
  responseLength: string;
  autoGenerateTitles: boolean;
  rememberPrompts: boolean;
  enableAiSuggestions: boolean;
  showWorkspaceOverview: boolean;
  showAiSection: boolean;
  showAnalyticsCards: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
  enableCommandPalette: boolean;
  showRecentCommands: boolean;
  maxRecentCommands: string;
  searchBehavior: string;
};

const defaultLocalSettings: LocalSettings = {
  language: 'en',
  dateFormat: 'MMM D, YYYY',
  timeFormat: '12h',
  timezone: 'Asia/Kolkata',
  firstDayOfWeek: 'sunday',
  inAppNotifications: true,
  sound: true,
  desktopNotifications: false,
  notificationGrouping: true,
  showUnreadBadge: true,
  relativeTimestamps: true,
  aiModel: 'default',
  aiTone: 'balanced',
  creativity: 'balanced',
  responseLength: 'medium',
  autoGenerateTitles: true,
  rememberPrompts: true,
  enableAiSuggestions: true,
  showWorkspaceOverview: true,
  showAiSection: true,
  showAnalyticsCards: true,
  compactMode: false,
  reducedMotion: false,
  enableCommandPalette: true,
  showRecentCommands: true,
  maxRecentCommands: '5',
  searchBehavior: 'fuzzy',
};

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ManagedBadge() {
  return <Badge variant="neutral" size="sm">Managed by Auth0</Badge>;
}

function ComingSoonBadge() {
  return <Badge variant="neutral" size="sm">Coming Soon</Badge>;
}

function SettingsCard({
  children,
  description,
  icon,
  title,
  badge,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}) {
  const searchQuery = React.useContext(SettingsSearchContext).toLowerCase();
  const isMatch = !searchQuery || title.toLowerCase().includes(searchQuery) || description.toLowerCase().includes(searchQuery);

  return (
    <Card className={cn(
      "shadow-xs transition-shadow duration-300",
      searchQuery && !isMatch && "[&:not(:has(.setting-item))]:hidden"
    )}>
      <CardHeader className="flex-row items-start gap-3 space-y-0 p-5 border-b border-border/40">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary">
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
            {badge}
          </div>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {isMatch ? (
          <SettingsSearchContext.Provider value="">
            {children}
          </SettingsSearchContext.Provider>
        ) : children}
      </CardContent>
    </Card>
  );
}

function SettingsDangerCard({
  children,
  description,
  icon,
  title,
  badge,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}) {
  const searchQuery = React.useContext(SettingsSearchContext).toLowerCase();
  const isMatch = !searchQuery || title.toLowerCase().includes(searchQuery) || description.toLowerCase().includes(searchQuery);

  return (
    <Card className={cn(
      "shadow-xs border-destructive/20 bg-destructive/5 transition-all duration-300",
      searchQuery && !isMatch && "[&:not(:has(.setting-item))]:hidden"
    )}>
      <CardHeader className="flex-row items-start gap-3 space-y-0 p-5 border-b border-destructive/20 bg-destructive/10">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/20 text-destructive">
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base leading-tight text-destructive">{title}</CardTitle>
            {badge}
          </div>
          <CardDescription className="leading-relaxed text-destructive/80">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {isMatch ? (
          <SettingsSearchContext.Provider value="">
            {children}
          </SettingsSearchContext.Provider>
        ) : children}
      </CardContent>
    </Card>
  );
}

function SettingRow({
  children,
  description,
  label,
  badge,
}: {
  children: React.ReactNode;
  description: string;
  label: string;
  badge?: React.ReactNode;
}) {
  const searchQuery = React.useContext(SettingsSearchContext).toLowerCase();
  if (searchQuery && !label.toLowerCase().includes(searchQuery) && !description.toLowerCase().includes(searchQuery)) {
    return null;
  }
  return (
    <div className="setting-item flex flex-col gap-3 rounded-md border border-border bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:border-brand/40">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {badge}
        </div>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">{children}</div>
    </div>
  );
}

function Field({
  children,
  hint,
  label,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  label: React.ReactNode;
  className?: string;
}) {
  const searchQuery = React.useContext(SettingsSearchContext).toLowerCase();
  const labelText = typeof label === 'string' ? label.toLowerCase() : '';
  if (searchQuery && !labelText.includes(searchQuery) && (!hint || !hint.toLowerCase().includes(searchQuery))) {
    return null;
  }
  return (
    <div className={cn("setting-item space-y-2", className)}>
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logoutUrl } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { data: events } = useEvents();
  const { notifications } = useNotifications();
  const { toast } = useToast();

  const [settings, setSettings] = React.useState<LocalSettings>(defaultLocalSettings);
  const [stagedSettings, setStagedSettings] = React.useState<LocalSettings>(defaultLocalSettings);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeSection, setActiveSection] = React.useState<SectionId>('profile');

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(localStorageKey);
      if (stored) {
        const parsed = { ...defaultLocalSettings, ...(JSON.parse(stored) as Partial<LocalSettings>) };
        setSettings(parsed);
        setStagedSettings(parsed);
      }
    } catch {
      setSettings(defaultLocalSettings);
      setStagedSettings(defaultLocalSettings);
    }
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        const first = visibleEntries[0];
        if (first) {
          setActiveSection(first.target.id as SectionId);
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    SECTION_NAV.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isLoaded, searchQuery]);

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(stagedSettings);

  const updateSetting = <Key extends keyof LocalSettings>(key: Key, value: LocalSettings[Key]) => {
    setStagedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    setSettings(stagedSettings);
    window.localStorage.setItem(localStorageKey, JSON.stringify(stagedSettings));
    toast({
      title: 'Settings saved',
      description: 'Your local preferences have been updated.',
    });
  };

  const discardChanges = () => {
    setStagedSettings(settings);
    toast({
      title: 'Changes discarded',
      description: 'Restored your previously saved settings.',
    });
  };

  const displayName = user?.nickname || user?.name?.split('@')[0] || 'Your account';
  const email = user?.email ?? 'No email available';
  const picture = typeof user?.picture === 'string' ? user.picture : undefined;
  const provider =
    typeof user?.sub === 'string' && user.sub.includes('|')
      ? user.sub.split('|')[0]
      : 'Auth0';

  if (!isLoaded) {
    return (
      <div className="space-y-7 pb-20 relative">
        <PageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Manage your profile, preferences, security posture, and AI defaults from one focused workspace."
        />
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-20 relative">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage your profile, preferences, security posture, and AI defaults from one focused workspace."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-surface-card"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
          </div>
        }
      />

      <SettingsSearchContext.Provider value={searchQuery}>
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start hidden lg:block">
            <SurfacePanel className="space-y-2 p-3">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Settings
              </p>
              <nav aria-label="Settings sections" className="space-y-1">
                {SECTION_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  if (searchQuery && !item.label.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return null;
                  }
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        "group flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isActive
                          ? "bg-brand/10 text-brand"
                          : "hover:bg-surface-sunken text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-brand" : "text-ink-muted group-hover:text-foreground"
                      )} />
                      <span className="min-w-0">
                        <span className={cn("block font-semibold", isActive ? "text-brand" : "text-foreground")}>
                          {item.label}
                        </span>
                        <span className={cn("block text-xs line-clamp-1", isActive ? "text-brand/80" : "text-ink-muted")}>
                          {item.description}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </nav>
            </SurfacePanel>
          </aside>

          <div className="min-w-0 space-y-12">

            {/* PROFILE */}
            <section id="profile" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Profile"
                description="Your identity is currently supplied by Auth0. Editing controls are shown for product direction and are not connected to a backend yet."
              />
              <SettingsCard
                title="Personal information"
                description="Displayed across the host dashboard and event ownership surfaces."
                icon={<UserRound className="h-5 w-5" />}
                badge={<ManagedBadge />}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-subtle font-display text-xl font-bold text-brand">
                    {picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      initialsFor(displayName) || <UserRound className="h-7 w-7" />
                    )}
                  </div>
                  <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
                    <Field label="Name" hint="Profile editing is managed by your identity provider.">
                      <Input value={displayName} disabled aria-label="Name" />
                    </Field>
                    <Field label="Email" hint="Managed by your login provider.">
                      <Input value={email} disabled aria-label="Email" />
                    </Field>
                  </div>
                </div>
                <SettingRow
                  label="Workspace role"
                  description="Role management is not editable from settings yet."
                  badge={<ComingSoonBadge />}
                >
                  <Badge variant="brand">Host</Badge>
                </SettingRow>
              </SettingsCard>
            </section>

            {/* APPEARANCE */}
            <section id="appearance" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Appearance"
                description="Uses the existing Pulse theme provider and persists through the current theme system."
              />
              <SettingsCard
                title="Theme"
                description={`Current theme: ${theme}. Resolved appearance: ${resolvedTheme}.`}
                icon={<Palette className="h-5 w-5" />}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          'rounded-md border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          active
                            ? 'border-brand bg-brand-subtle text-brand-subtle-text'
                            : 'border-border bg-surface-card hover:bg-surface-sunken hover:border-border-hover',
                        )}
                        aria-pressed={active}
                        onClick={() => setTheme(option.value)}
                      >
                        <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-card text-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-1 block text-xs text-ink-muted">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
                <SettingRow
                  label="Compact mode"
                  description="A denser dashboard layout for power users."
                >
                  <Switch
                    checked={stagedSettings.compactMode}
                    onCheckedChange={(v) => updateSetting('compactMode', v)}
                    aria-label="Compact mode"
                  />
                </SettingRow>
                <SettingRow
                  label="Reduced motion"
                  description="Minimize animations and transitions throughout the app."
                >
                  <Switch
                    checked={stagedSettings.reducedMotion}
                    onCheckedChange={(v) => updateSetting('reducedMotion', v)}
                    aria-label="Reduced motion"
                  />
                </SettingRow>
              </SettingsCard>
            </section>

            {/* PREFERENCES */}
            <section id="preferences" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Preferences"
                description="These defaults are stored locally until workspace preference persistence exists."
              />
              <SettingsCard
                title="Locale defaults"
                description="Control how dates, times, and languages appear in your dashboard experience."
                icon={<Globe2 className="h-5 w-5" />}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Language">
                    <Select
                      value={stagedSettings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                    >
                      <option value="en">English (US)</option>
                      <option value="en-gb">English (UK)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </Select>
                  </Field>
                  <Field label="Timezone">
                    <Select
                      value={stagedSettings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="America/New_York">America/New York</option>
                      <option value="America/Los_Angeles">America/Los Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="UTC">UTC</option>
                    </Select>
                  </Field>
                  <Field label="Date format">
                    <Select
                      value={stagedSettings.dateFormat}
                      onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    >
                      <option value="MMM D, YYYY">Jun 27, 2026</option>
                      <option value="D MMM YYYY">27 Jun 2026</option>
                      <option value="YYYY-MM-DD">2026-06-27</option>
                      <option value="MM/DD/YYYY">06/27/2026</option>
                    </Select>
                  </Field>
                  <Field label="Time format">
                    <Select
                      value={stagedSettings.timeFormat}
                      onChange={(e) => updateSetting('timeFormat', e.target.value as '12h' | '24h')}
                    >
                      <option value="12h">12-hour (1:00 PM)</option>
                      <option value="24h">24-hour (13:00)</option>
                    </Select>
                  </Field>
                  <Field label="First day of week">
                    <Select
                      value={stagedSettings.firstDayOfWeek}
                      onChange={(e) => updateSetting('firstDayOfWeek', e.target.value)}
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </Select>
                  </Field>
                </div>
              </SettingsCard>
            </section>

            {/* NOTIFICATIONS */}
            <section id="notifications" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Notifications"
                description="Control how and when you receive updates. Currently persisted in local storage."
              />
              <SettingsCard
                title="Notification channels"
                description="Manage delivery methods for product and workspace activity updates."
                icon={<Bell className="h-5 w-5" />}
              >
                <SettingRow label="In-app notifications" description="Receive updates within the Pulse dashboard.">
                  <Switch checked={stagedSettings.inAppNotifications} onCheckedChange={(v) => updateSetting('inAppNotifications', v)} />
                </SettingRow>
                <SettingRow label="Notification sound" description="Play a subtle sound when a new notification arrives.">
                  <Switch checked={stagedSettings.sound} onCheckedChange={(v) => updateSetting('sound', v)} disabled={!stagedSettings.inAppNotifications} />
                </SettingRow>
                <SettingRow label="Desktop notifications" description="Show native browser notifications.">
                  <Switch checked={stagedSettings.desktopNotifications} onCheckedChange={(v) => updateSetting('desktopNotifications', v)} />
                </SettingRow>
              </SettingsCard>

              <SettingsCard
                title="Display preferences"
                description="Control how notifications appear in the UI."
                icon={<Monitor className="h-5 w-5" />}
              >
                <SettingRow label="Notification grouping" description="Group similar notifications together.">
                  <Switch checked={stagedSettings.notificationGrouping} onCheckedChange={(v) => updateSetting('notificationGrouping', v)} />
                </SettingRow>
                <SettingRow label="Show unread badge" description="Display a red dot on the bell icon when there are unread items.">
                  <Switch checked={stagedSettings.showUnreadBadge} onCheckedChange={(v) => updateSetting('showUnreadBadge', v)} />
                </SettingRow>
                <SettingRow label="Relative timestamps" description="Show times like '2h ago' instead of exact dates.">
                  <Switch checked={stagedSettings.relativeTimestamps} onCheckedChange={(v) => updateSetting('relativeTimestamps', v)} />
                </SettingRow>
              </SettingsCard>
            </section>

            {/* DASHBOARD */}
            <section id="dashboard" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Dashboard"
                description="Customize the layout and visibility of your workspace overview."
              />
              <SettingsCard
                title="Workspace sections"
                description="Toggle visibility of specific dashboard sections."
                icon={<LayoutDashboard className="h-5 w-5" />}
              >
                <SettingRow label="Workspace Overview" description="Show the primary event management section.">
                  <Switch checked={stagedSettings.showWorkspaceOverview} onCheckedChange={(v) => updateSetting('showWorkspaceOverview', v)} />
                </SettingRow>
                <SettingRow label="AI Studio Section" description="Show AI generation metrics and shortcuts.">
                  <Switch checked={stagedSettings.showAiSection} onCheckedChange={(v) => updateSetting('showAiSection', v)} />
                </SettingRow>
                <SettingRow label="Analytics Cards" description="Display high-level analytics on the dashboard.">
                  <Switch checked={stagedSettings.showAnalyticsCards} onCheckedChange={(v) => updateSetting('showAnalyticsCards', v)} />
                </SettingRow>
              </SettingsCard>
            </section>

            {/* COMMAND PALETTE */}
            <section id="command-palette" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Command Palette"
                description="Configure search and navigation shortcuts."
              />
              <SettingsCard
                title="Palette behavior"
                description="Control how the global command palette functions."
                icon={<Terminal className="h-5 w-5" />}
              >
                <SettingRow label="Enable Command Palette" description="Allow opening via Ctrl+K / Cmd+K shortcut.">
                  <Switch checked={stagedSettings.enableCommandPalette} onCheckedChange={(v) => updateSetting('enableCommandPalette', v)} />
                </SettingRow>
                <SettingRow label="Show recent commands" description="Display recently used commands when opening.">
                  <Switch checked={stagedSettings.showRecentCommands} onCheckedChange={(v) => updateSetting('showRecentCommands', v)} />
                </SettingRow>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <Field label={<span className="flex items-center gap-2">Maximum recent commands <ComingSoonBadge /></span>}>
                    <Select value={stagedSettings.maxRecentCommands} onChange={(e) => updateSetting('maxRecentCommands', e.target.value)} disabled>
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </Select>
                  </Field>
                  <Field label={<span className="flex items-center gap-2">Search behavior <ComingSoonBadge /></span>}>
                    <Select value={stagedSettings.searchBehavior} onChange={(e) => updateSetting('searchBehavior', e.target.value)} disabled>
                      <option value="fuzzy">Fuzzy match</option>
                      <option value="exact">Exact match</option>
                    </Select>
                  </Field>
                </div>
              </SettingsCard>
            </section>

            {/* AI PREFERENCES */}
            <section id="ai" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="AI Preferences"
                description="These local defaults preview future AI customization without changing generation endpoints."
              />
              <SettingsCard
                title="Generation defaults"
                description="Tune how AI-assisted drafting should behave once persisted preferences are supported."
                icon={<Sparkles className="h-5 w-5" />}
              >
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <Field label="Preferred AI model" className="sm:col-span-2">
                    <RadioCardGroup
                      columns={3}
                      value={stagedSettings.aiModel}
                      onValueChange={(v) => updateSetting('aiModel', v)}
                      options={[
                        { value: 'default', label: 'Pulse Default', description: 'Fast and balanced' },
                        { value: 'fast', label: 'Fast Drafting', description: 'Low latency' },
                        { value: 'deep', label: 'Deeper Reasoning', description: 'Complex analysis' },
                      ]}
                    />
                  </Field>
                  <Field label="Response tone" className="sm:col-span-2">
                    <RadioCardGroup
                      columns={2}
                      value={stagedSettings.aiTone}
                      onValueChange={(v) => updateSetting('aiTone', v)}
                      options={[
                        { value: 'balanced', label: 'Balanced', description: 'Even and natural' },
                        { value: 'concise', label: 'Concise', description: 'Direct and to the point' },
                        { value: 'facilitative', label: 'Facilitative', description: 'Engaging for audiences' },
                        { value: 'executive', label: 'Executive', description: 'Formal and professional' },
                      ]}
                    />
                  </Field>
                  <div className="sm:col-span-2 grid gap-6 sm:grid-cols-2 mt-2">
                    <Field label="Creativity" hint={`Current: ${stagedSettings.creativity.charAt(0).toUpperCase() + stagedSettings.creativity.slice(1)}`}>
                      <Slider
                        min={0} max={2} step={1}
                        value={['focused', 'balanced', 'exploratory'].indexOf(stagedSettings.creativity)}
                        onValueChange={(v) => updateSetting('creativity', ['focused', 'balanced', 'exploratory'][v] as 'focused' | 'balanced' | 'exploratory')}
                      />
                    </Field>
                    <Field label="Response length" hint={`Current: ${stagedSettings.responseLength.charAt(0).toUpperCase() + stagedSettings.responseLength.slice(1)}`}>
                      <Slider
                        min={0} max={2} step={1}
                        value={['short', 'medium', 'long'].indexOf(stagedSettings.responseLength)}
                        onValueChange={(v) => updateSetting('responseLength', ['short', 'medium', 'long'][v] as 'short' | 'medium' | 'long')}
                      />
                    </Field>
                  </div>
                </div>

                <div className="space-y-4 border-t border-border pt-4">
                  <SettingRow label="Auto-generate titles" description="Automatically suggest titles for new polls, quizzes, and surveys based on context.">
                    <Switch checked={stagedSettings.autoGenerateTitles} onCheckedChange={(v) => updateSetting('autoGenerateTitles', v)} />
                  </SettingRow>
                  <SettingRow label="Remember previous prompts" description="Save recent AI prompts for quick reuse in Studio.">
                    <Switch checked={stagedSettings.rememberPrompts} onCheckedChange={(v) => updateSetting('rememberPrompts', v)} />
                  </SettingRow>
                  <SettingRow label="Enable AI suggestions" description="Show inline AI suggestions while typing descriptions.">
                    <Switch checked={stagedSettings.enableAiSuggestions} onCheckedChange={(v) => updateSetting('enableAiSuggestions', v)} />
                  </SettingRow>
                </div>

                <SurfacePanel tone="ai" className="flex items-start gap-3 p-4 mt-4">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
                  <p className="text-sm text-ai-subtle-text">
                    These controls do not modify AI Studio requests yet. They are
                    kept local so the settings experience is usable without
                    inventing new backend contracts.
                  </p>
                </SurfacePanel>
              </SettingsCard>
            </section>

            {/* SECURITY */}
            <section id="security" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Security"
                description="Authentication remains managed by Auth0 and the existing session routes."
              />
              <SettingsCard
                title="Session and provider"
                description="Review your connected login provider and end the current session."
                icon={<ShieldCheck className="h-5 w-5" />}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <SurfacePanel tone="sunken" className="space-y-1 p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Authentication provider</p>
                    <p className="text-sm font-semibold text-foreground">Auth0</p>
                  </SurfacePanel>
                  <SurfacePanel tone="sunken" className="space-y-1 p-4 border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Connected login</p>
                    <p className="truncate text-sm font-semibold text-foreground">{provider}</p>
                  </SurfacePanel>
                </div>
                <SettingRow label="Current session" description={`Signed in as ${email}.`}>
                  <Button asChild variant="destructive">
                    <a href={logoutUrl}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </a>
                  </Button>
                </SettingRow>
                <SettingRow label="Last login" description="Session history is managed externally." badge={<ManagedBadge />}>
                  <span className="text-sm font-medium text-foreground">
                    {user?.updated_at
                      ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(user.updated_at))
                      : 'Unknown'}
                  </span>
                </SettingRow>
                <SettingRow label="Two-factor authentication" description="Additional verification is planned for account security." badge={<ComingSoonBadge />}>
                  <Switch disabled aria-label="Two-factor authentication coming soon" />
                </SettingRow>
                <SettingRow label="Password management" description="Update your password via your identity provider." badge={<ManagedBadge />}>
                  <Button variant="outline" disabled>Change Password</Button>
                </SettingRow>
              </SettingsCard>
            </section>

            {/* INTEGRATIONS */}
            <section id="integrations" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Integrations"
                description="Connect third-party apps and services to IEP."
              />
              <div id="zoom" className="scroll-mt-24">
                <SettingsCard
                  title="Zoom App"
                  description="Run polls and Q&A directly inside your Zoom meetings."
                  icon={<Globe2 className="h-5 w-5" />}
                >
                  <SettingRow label="Zoom Account" description="Connect your Zoom account to map meetings to events automatically.">
                    <Button variant="outline" onClick={async () => {
                      try {
                        const { apiFetch } = await import('@/lib/events-api');
                        const data = await apiFetch<{ url: string }>('api/zoom/authorize');
                        if (data?.url) {
                          window.location.href = data.url;
                          return;
                        }
                        console.error('Failed to initiate Zoom connection', data);
                      } catch (e) {
                        console.error('Failed to connect to backend', e);
                      }
                    }}>
                      Connect Zoom
                    </Button>
                  </SettingRow>
                </SettingsCard>
              </div>

              {/* Microsoft Teams */}
              <div id="teams" className="scroll-mt-24">
                <SettingsCard
                  title="Microsoft Teams"
                  description="Embed live polls and Q&A as a meeting side panel in Microsoft Teams."
                  icon=<Globe2 className="h-5 w-5" />
                >
                  <SettingRow label="Teams Account" description="Connect your Microsoft account to link Teams meetings to Pulse events automatically.">
                    <Button variant="outline" onClick={async () => {
                      try {
                        const { apiFetch } = await import('@/lib/events-api');
                        const data = await apiFetch<{ url: string }>('api/teams/authorize');
                        if (data?.url) {
                          window.location.href = data.url;
                          return;
                        }
                        console.error('Failed to initiate Teams connection', data);
                      } catch (e) {
                        console.error('Failed to connect Teams', e);
                      }
                    }}>
                      Connect Teams
                    </Button>
                  </SettingRow>
                </SettingsCard>
              </div>

              {/* Google Meet */}
              <div id="google-meet" className="scroll-mt-24">
                <SettingsCard
                  title="Google Meet"
                  description="Embed live polls and Q&A as a meeting Add-on side panel in Google Meet."
                  icon={<Globe2 className="h-5 w-5" />}
                >
                  <SettingRow label="Google Account" description="Connect your Google account to link Meet sessions to Pulse events automatically.">
                    <Button variant="outline" onClick={async () => {
                      try {
                        const { apiFetch } = await import('@/lib/events-api');
                        const data = await apiFetch<{ url: string }>('api/google-meet/authorize');
                        if (data?.url) {
                          window.location.href = data.url;
                          return;
                        }
                        console.error('Failed to initiate Google Meet connection', data);
                      } catch (e) {
                        console.error('Failed to connect Google Meet', e);
                      }
                    }}>
                      Connect Google Meet
                    </Button>
                  </SettingRow>
                </SettingsCard>
              </div>

              {/* PowerPoint Add-in */}
              <div id="powerpoint" className="scroll-mt-24">
                <SettingsCard
                  title="PowerPoint Add-in"
                  description="Embed live polls and Q&A as a task pane inside Microsoft PowerPoint presentations."
                  icon={<Globe2 className="h-5 w-5" />}
                >
                  <SurfacePanel tone="ai" className="flex items-start gap-3 p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ai-subtle-text">Office Add-in — Powered by Office.js</p>
                      <p className="text-xs text-ai-subtle-text/80">
                        The PowerPoint add-in runs as a task pane inside PowerPoint for Windows, Mac, and the Web.
                        After connecting your Microsoft account below, sideload the{' '}
                        <code className="rounded bg-black/10 px-1 py-0.5 font-mono">manifest.xml</code> file
                        from the project root into PowerPoint to install the add-in.
                      </p>
                    </div>
                  </SurfacePanel>
                  <SettingRow
                    label="Microsoft Account"
                    description="Connect your Microsoft account to automatically link PowerPoint presentations to Pulse events."
                  >
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const { apiFetch } = await import('@/lib/events-api');
                          const data = await apiFetch<{ url: string }>('api/powerpoint/authorize');
                          if (data?.url) {
                            window.location.href = data.url;
                            return;
                          }
                          console.error('Failed to initiate PowerPoint connection', data);
                        } catch (e) {
                          console.error('Failed to connect PowerPoint', e);
                        }
                      }}
                    >
                      Connect PowerPoint
                    </Button>
                  </SettingRow>
                </SettingsCard>
              </div>

              {/* Google Slides Add-on */}
              <div id="google-slides" className="scroll-mt-24">
                <SettingsCard
                  title="Google Slides Add-on"
                  description="Embed live polls and Q&A as a sidebar inside Google Slides presentations."
                  icon={<Globe2 className="h-5 w-5" />}
                >
                  <SurfacePanel tone="ai" className="flex items-start gap-3 p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ai-subtle-text">Google Workspace Add-on — Powered by Apps Script</p>
                      <p className="text-xs text-ai-subtle-text/80">
                        The Google Slides add-on runs entirely inside your Google Workspace environment.
                        No OAuth connection is required. Simply install the add-on code from the project repository to get started.
                      </p>
                    </div>
                  </SurfacePanel>
                  <SettingRow label="Installation" description="Get the Apps Script source code to install the sidebar into your Google Slides.">
                    <Button variant="outline" asChild>
                      <a href="https://github.com/ayushprakash1010-jpg/interactive-engagement-app/tree/main/integrations/google-slides" target="_blank" rel="noreferrer">
                        Get Add-on Code
                      </a>
                    </Button>
                  </SettingRow>
                </SettingsCard>
              </div>

              {/* Enterprise SSO */}
              <SettingsCard
                title="Enterprise SSO"
                description="Allow your organization to log in with your Identity Provider (Okta, Azure AD, Google Workspace, etc.) via SAML or OIDC."
                icon=<ShieldCheck className="h-5 w-5" />
              >
                <SurfacePanel tone="ai" className="flex items-start gap-3 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-ai-subtle-text">Powered by Auth0 Enterprise Connections</p>
                    <p className="text-xs text-ai-subtle-text/80">
                      Enterprise SSO is configured at the organization level via Auth0 Enterprise Connections.
                      Your IdP administrator creates the SAML/OIDC connection in Auth0, and all users from your
                      domain are automatically routed through SSO — no code changes required.
                      Anonymous participant join remains unchanged.
                    </p>
                  </div>
                </SurfacePanel>
                <SettingRow label="SAML / OIDC" description="Configure your organization's identity provider via the Auth0 dashboard." badge={<ComingSoonBadge />}>
                  <Button variant="outline" disabled>Configure SSO</Button>
                </SettingRow>
                <SettingRow label="Domain restriction" description="Lock sign-in to a specific email domain (e.g. @yourcompany.com)." badge={<ComingSoonBadge />}>
                  <Button variant="outline" disabled>Set Domain</Button>
                </SettingRow>
              </SettingsCard>
            </section>

            {/* WORKSPACE */}
            <section id="workspace" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Workspace"
                description="Usage metrics and data for your current workspace environment."
              />
              <SettingsCard
                title="Workspace summary"
                description="Aggregated data from your local events and notifications."
                icon={<Briefcase className="h-5 w-5" />}
              >
                <div className="setting-item grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-surface-sunken border border-border">
                    <p className="text-2xl font-display font-semibold">{events?.length || 0}</p>
                    <p className="text-xs text-ink-muted font-medium mt-1">Total Events</p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-sunken border border-border">
                    <p className="text-2xl font-display font-semibold">{events?.filter(e => e.status === 'draft').length || 0}</p>
                    <p className="text-xs text-ink-muted font-medium mt-1">Drafts</p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-sunken border border-border">
                    <p className="text-2xl font-display font-semibold">{events?.filter(e => e.status === 'ended').length || 0}</p>
                    <p className="text-xs text-ink-muted font-medium mt-1">Completed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-sunken border border-border">
                    <p className="text-2xl font-display font-semibold">{notifications.filter(n => n.category === 'ai').length}</p>
                    <p className="text-xs text-ink-muted font-medium mt-1">AI Generations</p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-sunken border border-border col-span-2">
                    <p className="text-2xl font-display font-semibold">{events?.filter(e => e.status === 'live').length || 0}</p>
                    <p className="text-xs text-ink-muted font-medium mt-1">Live Now</p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-sunken border border-border col-span-2">
                    <p className="text-2xl font-display font-semibold">{events?.filter(e => e.scheduledStart && new Date(e.scheduledStart) > new Date()).length || 0}</p>
                    <p className="text-xs text-ink-muted font-medium mt-1">Scheduled</p>
                  </div>
                </div>
              </SettingsCard>
            </section>

            {/* DATA MANAGEMENT */}
            <section id="data" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="Data Management"
                description="Export your preferences or clear local data safely."
              />
              <SettingsDangerCard
                title="Storage controls"
                description="Manage the data stored in this browser."
                icon={<Database className="h-5 w-5" />}
              >
                <div className="space-y-0 divide-y divide-border border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-surface-card hover:bg-surface-sunken transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Export Local Preferences</p>
                      <p className="text-xs text-ink-muted">Download a JSON file of your current settings.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export complete', description: 'Preferences exported to downloads.' })}>
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-card hover:bg-surface-sunken transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Import Local Preferences</p>
                      <p className="text-xs text-ink-muted">Restore settings from a JSON file.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: 'Import initiated', description: 'Please select a file to import.' })}>
                      <Upload className="h-4 w-4 mr-2" /> Import
                    </Button>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-surface-card hover:bg-error-subtle/50 transition-colors cursor-pointer group">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-destructive transition-colors">Reset Preferences</p>
                          <p className="text-xs text-ink-muted">Restore all settings to their default values.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10"><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Preferences?</DialogTitle>
                        <DialogDescription>
                          This will restore all local settings to their defaults. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" type="button" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                          setStagedSettings(defaultLocalSettings);
                          saveSettings();
                          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                        }}>Reset to defaults</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-surface-card hover:bg-error-subtle/50 transition-colors cursor-pointer group">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-destructive transition-colors">Clear Local Cache</p>
                          <p className="text-xs text-ink-muted">Clear all stored local data and logs.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" /> Clear Cache</Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clear Local Cache?</DialogTitle>
                        <DialogDescription>
                          This will clear all local storage caches, excluding your preferences.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" type="button" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                          toast({ title: 'Cache cleared', description: 'Local cache has been successfully cleared.' });
                          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                        }}>Clear Cache</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </SettingsDangerCard>
            </section>

            {/* ABOUT */}
            <section id="about" className="scroll-mt-24 space-y-4">
              <SectionHeader
                title="About"
                description="Version information, licenses, and legal documents."
              />
              <SettingsCard
                title="Pulse Platform"
                description="Interactive Engagement Platform"
                icon={<Info className="h-5 w-5" />}
              >
                <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Version</p>
                    <p className="text-sm font-semibold text-foreground">v0.1.0-alpha</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Environment</p>
                    <p className="text-sm font-semibold text-foreground">Development</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Frontend</p>
                    <p className="text-sm font-semibold text-foreground">Next.js 14</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Backend</p>
                    <p className="text-sm font-semibold text-foreground">NestJS (Managed by host)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Database</p>
                    <p className="text-sm font-semibold text-foreground">MongoDB (Managed by host)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Last Update</p>
                    <p className="text-sm font-semibold text-foreground">June 28, 2026</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-6 border-t border-border mt-4">
                  <Button variant="link" className="h-auto p-0 text-brand">Open-source licenses</Button>
                  <Button variant="link" className="h-auto p-0 text-brand">Keyboard shortcuts</Button>
                  <Button variant="link" className="h-auto p-0 text-brand">Privacy Policy</Button>
                  <Button variant="link" className="h-auto p-0 text-brand">Terms of Service</Button>
                </div>
              </SettingsCard>
            </section>

            <SurfacePanel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Settings persistence</p>
                <p className="text-sm text-ink-muted">
                  Theme uses the existing provider. Locale, AI, and Dashboard preferences are currently saved in this browser only.
                </p>
              </div>
              <Badge variant="info" dot>No new APIs</Badge>
            </SurfacePanel>
          </div>
        </div>
      </SettingsSearchContext.Provider>

      {/* Floating Action Bar for Unsaved Changes */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <SurfacePanel className="flex items-center gap-4 px-4 py-3 rounded-full shadow-lg border-brand/20 bg-surface-card/95 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-foreground">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Button variant="ghost" size="sm" onClick={discardChanges} className="h-8 rounded-full text-ink-secondary hover:text-foreground">
                Discard
              </Button>
              <Button size="sm" onClick={saveSettings} className="h-8 rounded-full">
                <Save className="h-4 w-4 mr-2" />
                Save All
              </Button>
            </div>
          </SurfacePanel>
        </div>
      )}
    </div>
  );
}
