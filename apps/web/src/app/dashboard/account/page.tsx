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
  Copy,
  Check,
  Download,
  LayoutDashboard,
  LogOut,
  Mail,
  PlayCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  UserRound,
  Zap,
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
  ProfileSkeleton,
  MetricCardSkeleton,
  ListSkeleton,
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

  // Derive real account timestamps from Auth0 user metadata
  const memberSince = React.useMemo(() => {
    const raw = (user as any)?.updated_at || (user as any)?.created_at;
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }, [user]);

  // Account age label e.g. "Member for 3 months"
  const accountAge = React.useMemo(() => {
    const raw = (user as any)?.updated_at || (user as any)?.created_at;
    if (!raw) return null;
    const diffMs = Date.now() - new Date(raw).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'Member since today';
    if (diffDays < 7) return `Member for ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Member for ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    if (diffDays < 365) return `Member for ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''}`;
    return `Member for ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
  }, [user]);

  // Email verified from Auth0
  const emailVerified = (user as any)?.email_verified === true;

  const lastLogin = React.useMemo(() => {
    const raw = (user as any)?.updated_at;
    if (!raw) return 'Today';
    const date = new Date(raw);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [user]);

  // Real computed metrics from actual data
  const scheduledEvents = events?.filter(e => {
    if (!e.scheduledStart) return false;
    return new Date(e.scheduledStart) > new Date();
  }).length || 0;

  // 30-day activity heatmap: count events updated/created per day
  const heatmapData = React.useMemo(() => {
    const today = new Date();
    const days: { date: Date; count: number; label: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStr = d.toDateString();
      const count = (events || []).filter(e => {
        const ts = new Date(e.updatedAt || e.createdAt);
        ts.setHours(0, 0, 0, 0);
        return ts.toDateString() === dayStr;
      }).length;
      days.push({
        date: d,
        count,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [events]);
  const maxHeatmapCount = Math.max(...heatmapData.map(d => d.count), 1);

  // Plan limits (for free tier display)
  const PLAN_LIMITS = { events: 50, aiGenerations: 30, sessions: 100 };
  const planUsage = {
    events: Math.min(totalEvents, PLAN_LIMITS.events),
    aiGenerations: Math.min(aiGenerations, PLAN_LIMITS.aiGenerations),
    sessions: Math.min(completedEvents, PLAN_LIMITS.sessions),
  };

  // Export data handler
  const [exporting, setExporting] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);
  const handleCopyUserId = React.useCallback(() => {
    const uid = (user as any)?.sub;
    if (!uid) return;
    navigator.clipboard.writeText(uid).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  }, [user]);
  const handleExport = React.useCallback(() => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows = [
        ['Name', 'Status', 'Created', 'Updated', 'Event Code'],
        ...(events || []).map(e => [
          e.name,
          e.status,
          new Date(e.createdAt).toISOString(),
          new Date(e.updatedAt).toISOString(),
          e.eventCode,
        ]),
      ];
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pulse-events-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 1500);
    }
  }, [events, exporting]);

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
          {/* SECTION 1: PROFILE */}
          {eventsLoading ? (
            <ProfileSkeleton />
          ) : (
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
                      {emailVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          <Check className="h-2.5 w-2.5" />
                          Verified
                        </span>
                      )}
                    </p>
                    {accountAge && (
                      <p className="mt-1 text-xs text-ink-faint">{accountAge}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-muted flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    Profile is managed by your identity provider ({provider}).
                  </p>
                  {(user as any)?.sub && (
                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      title="Copy User ID"
                      className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface-sunken px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-all hover:border-brand/40 hover:text-brand hover:bg-brand/5 active:scale-95"
                    >
                      {copiedId ? (
                        <><Check className="h-3 w-3 text-success" /> Copied!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy User ID</>
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 3: ACTIVITY SUMMARY */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted px-1">Workspace Activity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {eventsLoading ? Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />) : (
                <>
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
                    label="Active Sessions" 
                    value={activeEvents} 
                    icon={<Activity className="h-4 w-4 text-success" />} 
                    className="bg-surface-card border-border/40 shadow-xs"
                  />
                  <MetricCard 
                    label="Scheduled" 
                    value={scheduledEvents} 
                    icon={<Clock className="h-4 w-4 text-brand" />} 
                    className="bg-surface-card border-border/40 shadow-xs"
                  />
                  <MetricCard 
                    label="AI Generations" 
                    value={aiGenerations} 
                    icon={<Sparkles className="h-4 w-4 text-ai" />} 
                    className="bg-surface-card border-border/40 shadow-xs"
                  />
                </>
              )}
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
              {eventsLoading ? (
                <ListSkeleton count={5} />
              ) : recentEvents.length > 0 ? (
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
              {eventsLoading ? (
                <ListSkeleton count={8} />
              ) : recentNotifications.length > 0 ? (
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

          {/* SECTION 5: 30-DAY ACTIVITY HEATMAP */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Activity Heatmap</CardTitle>
                  <CardDescription>Events created or updated in the last 30 days.</CardDescription>
                </div>
                <TrendingUp className="h-4 w-4 text-ink-muted" />
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex items-end gap-1 h-14">
                {heatmapData.map((day, i) => {
                  const intensity = day.count === 0 ? 0 : Math.ceil((day.count / maxHeatmapCount) * 4);
                  const bgClass = [
                    'bg-surface-sunken',
                    'bg-brand/20',
                    'bg-brand/40',
                    'bg-brand/65',
                    'bg-brand',
                  ][intensity] ?? 'bg-brand';
                  const isToday = i === heatmapData.length - 1;
                  return (
                    <div
                      key={day.label}
                      title={`${day.label}: ${day.count} event${day.count !== 1 ? 's' : ''}`}
                      className={cn(
                        'flex-1 rounded-sm transition-all duration-200 cursor-default',
                        bgClass,
                        isToday && 'ring-1 ring-brand',
                      )}
                      style={{ height: `${day.count === 0 ? 20 : 20 + (day.count / maxHeatmapCount) * 36}%` }}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-faint">30 days ago</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-ink-faint">Less</span>
                  {['bg-surface-sunken', 'bg-brand/20', 'bg-brand/40', 'bg-brand/65', 'bg-brand'].map(c => (
                    <span key={c} className={cn('h-3 w-3 rounded-sm', c)} />
                  ))}
                  <span className="text-xs text-ink-faint">More</span>
                </div>
                <span className="text-xs text-ink-faint">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* PLAN CARD */}
          <Card className="border-brand/20 shadow-xs bg-gradient-to-b from-brand-subtle/40 to-surface-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-subtle ring-1 ring-brand/20">
                    <Zap className="h-3.5 w-3.5 text-brand" />
                  </span>
                  <CardTitle className="text-base">Free Plan</CardTitle>
                </div>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs border-brand/30 text-brand hover:bg-brand/10">
                  <a href="#">Upgrade</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Events Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Events</span>
                  <span className="font-semibold text-foreground">{planUsage.events} <span className="text-ink-faint font-normal">/ {PLAN_LIMITS.events}</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-700"
                    style={{ width: `${Math.min((planUsage.events / PLAN_LIMITS.events) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {/* AI Generations Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-secondary font-medium">AI Generations</span>
                  <span className="font-semibold text-foreground">{planUsage.aiGenerations} <span className="text-ink-faint font-normal">/ {PLAN_LIMITS.aiGenerations}</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      planUsage.aiGenerations / PLAN_LIMITS.aiGenerations > 0.8 ? 'bg-warning' : 'bg-ai',
                    )}
                    style={{ width: `${Math.min((planUsage.aiGenerations / PLAN_LIMITS.aiGenerations) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {/* Sessions Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-secondary font-medium">Completed Sessions</span>
                  <span className="font-semibold text-foreground">{planUsage.sessions} <span className="text-ink-faint font-normal">/ {PLAN_LIMITS.sessions}</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-700"
                    style={{ width: `${Math.min((planUsage.sessions / PLAN_LIMITS.sessions) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-ink-faint pt-1 border-t border-border/40">
                Usage resets monthly. <a href="#" className="text-brand hover:underline">View pricing →</a>
              </p>
            </CardContent>
          </Card>

          {/* SECTION 2: ACCOUNT DETAILS */}
          <Card className="border-border/40 shadow-xs bg-surface-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Member Since</span>
                <span className="text-sm font-medium text-foreground">{memberSince}</span>
              </SurfacePanel>
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Last Login</span>
                <span className="text-sm font-medium text-foreground">{lastLogin}</span>
              </SurfacePanel>
              <SurfacePanel tone="sunken" className="p-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Provider</span>
                <span className="text-sm font-medium capitalize text-foreground">{provider}</span>
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

          {/* DATA EXPORT CARD */}
          <Card className="border-border/40 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Data</CardTitle>
              <CardDescription>Download your workspace data as CSV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border/40 bg-surface-sunken/50 p-3 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-card border border-border shadow-sm">
                  <Calendar className="h-4 w-4 text-ink-muted" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Events &amp; Sessions</p>
                  <p className="text-xs text-ink-muted">{totalEvents} records &middot; CSV format</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={handleExport}
                  disabled={exporting || eventsLoading || totalEvents === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {exporting ? 'Exporting…' : 'Export'}
                </Button>
              </div>
              <p className="text-xs text-ink-faint">
                Exports event names, statuses, event codes, and timestamps.
              </p>
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
