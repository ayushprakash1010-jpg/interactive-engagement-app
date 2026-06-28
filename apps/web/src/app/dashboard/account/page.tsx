'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  LayoutDashboard,
  LogOut,
  Mail,
  PlayCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  SurfacePanel,
  MetricCard,
  StatusBadge,
  EmptyState,
} from '@/components/ui';
import { useAuth } from '@/lib/use-auth';
import { useEvents } from '@/lib/use-events';
import { useNotifications } from '@/lib/notification-store';
import { useCommandPalette, openCommandPalette } from '@/lib/command-palette-store';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

function formatRelativeTime(isoString: string | Date): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

// Reuse local settings schema
const localStorageKey = 'iep-settings-preferences';

const defaultLocalSettings = {
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

function ManagedBadge() {
  return <Badge variant="neutral" size="sm">Managed by Auth0</Badge>;
}

function ComingSoonBadge() {
  return <Badge variant="neutral" size="sm">Coming Soon</Badge>;
}

export default function AccountPage() {
  const { user, logoutUrl } = useAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { notifications } = useNotifications();
  const { theme } = useTheme();

  const [settings, setSettings] = React.useState(defaultLocalSettings);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(localStorageKey);
      if (stored) {
        setSettings({ ...defaultLocalSettings, ...JSON.parse(stored) });
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const displayName = user?.nickname || user?.name?.split('@')[0] || 'Your account';
  const email = user?.email ?? 'No email available';
  const picture = typeof user?.picture === 'string' ? user.picture : undefined;
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const provider = typeof user?.sub === 'string' && user.sub.includes('|')
    ? user.sub.split('|')[0]
    : 'Auth0';

  // Computed metrics
  const totalEvents = events?.length || 0;
  const draftEvents = events?.filter(e => e.status === 'draft').length || 0;
  const completedEvents = events?.filter(e => e.status === 'ended').length || 0;
  const activeEvents = events?.filter(e => e.status === 'live').length || 0;
  const aiGenerations = notifications.filter(n => n.category === 'ai').length;

  // Recent 5 events
  const recentEvents = [...(events || [])]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  // Recent 10 notifications
  const recentNotifications = [...notifications].slice(0, 10);

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Profile"
        title="Account"
        description="View your signed-in identity, workspace activity, and managed preferences."
        actions={
          <Button asChild variant="outline">
            <a href={logoutUrl}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: PROFILE */}
          <Card className="overflow-hidden border-border/40 shadow-xs relative">
            <div className="absolute top-0 right-0 p-4">
               <ManagedBadge />
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-display text-2xl font-bold text-brand overflow-hidden shadow-sm">
                  {picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    initials || <UserRound className="h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-display font-bold text-foreground truncate">
                      {displayName}
                    </h2>
                    <Badge variant="brand" size="sm">Host</Badge>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <p className="text-sm text-ink-muted flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {email}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/40">
                <p className="text-xs text-ink-muted flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  Profile information is managed by your identity provider ({provider}).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: ACTIVITY SUMMARY */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted px-1">Workspace Activity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MetricCard 
                label="Events Created" 
                value={totalEvents} 
                icon={<Calendar className="h-4 w-4" />} 
                className="bg-surface-card border-border/40 shadow-xs"
              />
              <MetricCard 
                label="Drafts" 
                value={draftEvents} 
                icon={<PlayCircle className="h-4 w-4 text-warning" />} 
                className="bg-surface-card border-border/40 shadow-xs"
              />
              <MetricCard 
                label="Completed" 
                value={completedEvents} 
                icon={<CheckCircle2 className="h-4 w-4 text-success" />} 
                className="bg-surface-card border-border/40 shadow-xs"
              />
              <MetricCard 
                label="Est. Participants" 
                value={totalEvents * 32} 
                icon={<UserRound className="h-4 w-4" />} 
                className="bg-surface-card border-border/40 shadow-xs"
              />
              <MetricCard 
                label="Est. Responses" 
                value={totalEvents * 147} 
                icon={<Activity className="h-4 w-4" />} 
                className="bg-surface-card border-border/40 shadow-xs"
              />
              <MetricCard 
                label="AI Generations" 
                value={aiGenerations} 
                icon={<Sparkles className="h-4 w-4 text-ai" />} 
                className="bg-surface-card border-border/40 shadow-xs"
              />
            </div>
          </div>

          {/* SECTION 4: RECENT EVENTS */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
              <div className="space-y-1">
                <CardTitle className="text-base">Recent Events</CardTitle>
                <CardDescription>The latest events in your workspace.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/events">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentEvents.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentEvents.map(event => (
                    <div key={event._id} className="flex items-center justify-between p-4 hover:bg-surface-sunken transition-colors group">
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                            {event.name}
                          </p>
                          <StatusBadge status={event.status} />
                        </div>
                        <p className="text-xs text-ink-muted flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Updated {formatRelativeTime(event.updatedAt || event.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {event.status === 'draft' ? (
                          <Button asChild variant="secondary" size="sm" className="h-8 text-xs">
                            <Link href={`/dashboard/events/${event._id}`}>
                              Continue
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                            <Link href={`/dashboard/events/${event._id}`}>
                              Open
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    icon={<Calendar />}
                    title="No recent events"
                    description="You haven't created any events yet."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 6: RECENT ACTIVITY */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
              <div className="space-y-1">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Your latest actions and notifications.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentNotifications.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentNotifications.map(notification => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 hover:bg-surface-sunken transition-colors">
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        notification.category === 'session' ? "bg-brand-subtle text-brand" : "",
                        notification.category === 'event' ? "bg-success/10 text-success" : "",
                        notification.category === 'ai' ? "bg-ai/10 text-ai" : "",
                        notification.category === 'warning' ? "bg-warning/10 text-warning" : "",
                      )}>
                        {notification.category === 'ai' ? <Sparkles className="h-4 w-4" /> : 
                         notification.category === 'event' ? <Calendar className="h-4 w-4" /> : 
                         <Bell className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-ink-secondary mt-0.5">{notification.description}</p>
                        <p className="text-xs text-ink-muted mt-1">{formatRelativeTime(notification.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    icon={<Bell />}
                    title="No recent activity"
                    description="Your activity log is currently empty."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* SECTION 2: ACCOUNT DETAILS */}
          <Card className="border-border/40 shadow-xs bg-surface-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Member Since</span>
                <span className="text-sm font-medium text-foreground">Jun 2026</span>
              </SurfacePanel>
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Last Login</span>
                <span className="text-sm font-medium text-foreground">Today</span>
              </SurfacePanel>
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Provider</span>
                <span className="text-sm font-medium capitalize text-foreground">{provider}</span>
              </SurfacePanel>
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Account Type</span>
                <span className="text-sm font-medium text-foreground">Pro (Trial)</span>
              </SurfacePanel>
            </CardContent>
          </Card>

          {/* SECTION 7: QUICK ACTIONS */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/events" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-sunken transition-colors border border-transparent hover:border-border/50 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-card border border-border shadow-sm group-hover:bg-brand-subtle group-hover:border-brand/20 group-hover:text-brand transition-colors">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">Create Event</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-muted group-hover:text-brand transition-colors" />
              </Link>
              
              <Link href="/dashboard/ai" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-sunken transition-colors border border-transparent hover:border-border/50 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-card border border-border shadow-sm group-hover:bg-ai/10 group-hover:border-ai/20 group-hover:text-ai transition-colors">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-ai transition-colors">AI Studio</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-muted group-hover:text-ai transition-colors" />
              </Link>
              
              <button onClick={openCommandPalette} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-sunken transition-colors border border-transparent hover:border-border/50 group text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-card border border-border shadow-sm group-hover:bg-brand-subtle group-hover:border-brand/20 group-hover:text-brand transition-colors">
                  <Terminal className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">Command Palette</p>
                </div>
                <kbd className="rounded border border-border bg-surface-card px-1.5 py-0.5 font-mono text-[10px] text-ink-muted shadow-sm group-hover:border-brand/20 group-hover:text-brand">Ctrl K</kbd>
              </button>

              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-sunken transition-colors border border-transparent hover:border-border/50 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-card border border-border shadow-sm group-hover:bg-brand-subtle group-hover:border-brand/20 group-hover:text-brand transition-colors">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">Settings</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-muted group-hover:text-brand transition-colors" />
              </Link>
            </CardContent>
          </Card>

          {/* SECTION 5: PREFERENCES SUMMARY */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Local Preferences</CardTitle>
              <CardDescription>Snapshot of your current settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-sunken transition-colors group">
                <div>
                  <p className="text-xs font-semibold text-foreground">Theme</p>
                  <p className="text-xs text-ink-muted capitalize">{theme}</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href="/dashboard/settings#appearance">Edit</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-sunken transition-colors group">
                <div>
                  <p className="text-xs font-semibold text-foreground">Language & Timezone</p>
                  <p className="text-xs text-ink-muted uppercase">{settings.language} • {settings.timezone.split('/')[1]}</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href="/dashboard/settings#preferences">Edit</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-sunken transition-colors group">
                <div>
                  <p className="text-xs font-semibold text-foreground">Notifications</p>
                  <p className="text-xs text-ink-muted">{settings.inAppNotifications ? 'Enabled' : 'Disabled'}</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href="/dashboard/settings#notifications">Edit</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-sunken transition-colors group">
                <div>
                  <p className="text-xs font-semibold text-foreground">AI Model</p>
                  <p className="text-xs text-ink-muted capitalize">{settings.aiModel}</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href="/dashboard/settings#ai">Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 8: ACCOUNT & SECURITY */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-destructive">Account & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Two-Factor Authentication</p>
                <div className="flex items-center gap-2">
                  <ComingSoonBadge />
                  <span className="text-xs text-ink-muted">Planned for future update</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Password Management</p>
                <div className="flex items-center gap-2">
                  <ManagedBadge />
                </div>
              </div>
              <div className="pt-4 border-t border-border/40">
                <Button asChild variant="outline" className="w-full text-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors">
                  <a href={logoutUrl}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out of session
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
