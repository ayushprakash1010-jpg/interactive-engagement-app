'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BellRing,
  CheckCircle2,
  CheckCheck,
  Circle,
  Clock3,
  Download,
  FolderKanban,
  Megaphone,
  MessageSquareText,
  Radio,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { apiFetchBlob } from '@/lib/events-api';
import {
  clearNotifications,
  dismissNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
  type NotificationCategory,
  useNotifications,
} from '@/lib/notification-store';
import { useNotificationCenterSignal } from '@/lib/notification-center-store';
import { cn } from '@/lib/utils';

type NotificationFilter =
  | 'all'
  | 'unread'
  | 'ai'
  | 'events'
  | 'analytics'
  | 'sessions'
  | 'participants';

const filters: Array<{ id: NotificationFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'ai', label: 'AI' },
  { id: 'events', label: 'Events' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'participants', label: 'Participants' },
];

const categoryMeta: Record<
  NotificationCategory,
  {
    label: string;
    badge: BadgeProps['variant'];
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  success: {
    label: 'Success',
    badge: 'success',
    icon: CheckCircle2,
    className: 'bg-success-subtle text-success',
  },
  ai: {
    label: 'AI',
    badge: 'ai',
    icon: Sparkles,
    className: 'bg-ai-subtle text-ai',
  },
  event: {
    label: 'Event',
    badge: 'brand',
    icon: FolderKanban,
    className: 'bg-brand-subtle text-brand',
  },
  analytics: {
    label: 'Analytics',
    badge: 'info',
    icon: BarChart3,
    className: 'bg-info-subtle text-info',
  },
  session: {
    label: 'Session',
    badge: 'warning',
    icon: Clock3,
    className: 'bg-warning-subtle text-[var(--warning-text)]',
  },
  participant: {
    label: 'Participant',
    badge: 'info',
    icon: Users,
    className: 'bg-info-subtle text-info',
  },
  warning: {
    label: 'Warning',
    badge: 'warning',
    icon: AlertTriangle,
    className: 'bg-warning-subtle text-[var(--warning-text)]',
  },
  error: {
    label: 'Error',
    badge: 'destructive',
    icon: AlertTriangle,
    className: 'bg-error-subtle text-destructive',
  },
};

function NotificationIcon({ notification }: { notification: Notification }) {
  const className = 'h-4 w-4';

  if (notification.type.startsWith('ai-')) return <Sparkles className={className} />;
  if (notification.type.includes('participant')) return <Users className={className} />;
  if (notification.type.includes('analytics')) return <BarChart3 className={className} />;
  if (notification.type.includes('poll') || notification.type.includes('quiz')) {
    return <Radio className={className} />;
  }
  if (notification.type.includes('feedback') || notification.type.includes('reply')) {
    return <MessageSquareText className={className} />;
  }

  const CategoryIcon = categoryMeta[notification.category].icon;
  return <CategoryIcon className={className} />;
}

function formatNotificationTime(timestamp: string, now: number) {
  const date = new Date(timestamp);
  const diffSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds} sec ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  if (diffHours < 48) return 'Yesterday';

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function matchesFilter(notification: Notification, filter: NotificationFilter) {
  switch (filter) {
    case 'unread':
      return !notification.read;
    case 'ai':
      return notification.category === 'ai';
    case 'events':
      return notification.category === 'event' || notification.category === 'success';
    case 'analytics':
      return notification.category === 'analytics';
    case 'sessions':
      return notification.category === 'session';
    case 'participants':
      return notification.category === 'participant';
    default:
      return true;
  }
}

async function downloadNotificationFile(notification: Notification) {
  if (!notification.download) return;

  const blob = await apiFetchBlob(notification.download.path);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = notification.download.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  markNotificationRead(notification.id);
}

function NotificationRow({
  notification,
  now,
}: {
  notification: Notification;
  now: number;
}) {
  const meta = categoryMeta[notification.category];
  const content = (
    <span className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-3">
      <span
        className={cn(
          'mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md',
          meta.className,
        )}
      >
        <NotificationIcon notification={notification} />
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground">
                {notification.title}
              </span>
              {notification.count > 1 && (
                <Badge variant="neutral" size="sm">
                  x{notification.count}
                </Badge>
              )}
            </span>
            <span className="mt-1 block text-sm leading-5 text-ink-secondary">
              {notification.description}
            </span>
          </span>

          {!notification.read && (
            <Circle className="mt-1 h-2 w-2 shrink-0 fill-brand text-brand" aria-hidden />
          )}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={meta.badge} size="sm">
            {meta.label}
          </Badge>
          <time
            dateTime={notification.timestamp}
            className="text-xs text-ink-muted"
          >
            {formatNotificationTime(notification.timestamp, now)}
          </time>
        </span>
      </span>
    </span>
  );

  return (
    <article
      className={cn(
        'group border-b border-border px-3 py-2.5 transition-colors hover:bg-surface-sunken/80',
        !notification.read && 'bg-brand-subtle/25',
      )}
    >
      <div className="flex items-start gap-2">
        {notification.href ? (
          <Link
            href={notification.href}
            onClick={() => markNotificationRead(notification.id)}
            className="flex min-w-0 flex-1 rounded-md p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {content}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => markNotificationRead(notification.id)}
            className="flex min-w-0 flex-1 rounded-md p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {content}
          </button>
        )}

        <div className="flex shrink-0 items-center gap-1 pt-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {notification.download && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Download ${notification.title}`}
              className="h-8 w-8"
              onClick={() => void downloadNotificationFile(notification)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Dismiss ${notification.title}`}
            className="h-8 w-8"
            onClick={() => dismissNotification(notification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<NotificationFilter>('all');
  const [now, setNow] = React.useState(() => Date.now());
  const [ringing, setRinging] = React.useState(false);
  const previousUnreadRef = React.useRef(0);
  const { notifications } = useNotifications();
  const { openSignal } = useNotificationCenterSignal();
  const unreadCount = React.useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  // Open when the command palette triggers the signal
  React.useEffect(() => {
    if (openSignal > 0) {
      setOpen(true);
    }
  }, [openSignal]);

  React.useEffect(() => {
    if (!open) return;

    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, [open]);

  React.useEffect(() => {
    if (unreadCount > previousUnreadRef.current) {
      setRinging(true);
      const timeout = window.setTimeout(() => setRinging(false), 220);
      previousUnreadRef.current = unreadCount;
      return () => window.clearTimeout(timeout);
    }

    previousUnreadRef.current = unreadCount;
    return undefined;
  }, [unreadCount]);

  const filteredNotifications = React.useMemo(
    () =>
      notifications.filter((notification) =>
        matchesFilter(notification, filter),
      ),
    [filter, notifications],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative overflow-visible"
          aria-label={
            unreadCount > 0
              ? `Open notifications, ${unreadCount} unread`
              : 'Open notifications'
          }
        >
          <Bell
            className={cn(
              'h-4 w-4 origin-top transition-transform duration-200 motion-reduce:transition-none',
              ringing && 'motion-safe:-rotate-12 motion-safe:scale-110',
            )}
          />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[0.625rem] font-bold leading-none text-brand-foreground shadow-sm transition-transform duration-200 motion-reduce:transition-none',
                ringing && 'motion-safe:scale-110',
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="bottom-0 left-auto right-0 top-auto flex h-[92vh] max-h-[760px] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-lg border-border bg-surface-card p-0 shadow-xl data-[state=open]:slide-in-from-bottom sm:bottom-auto sm:top-4 sm:h-[min(760px,calc(100vh-2rem))] sm:w-[460px] sm:rounded-lg sm:data-[state=open]:slide-in-from-right"
      >
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-surface-raised px-4 py-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 font-display text-lg">
                <BellRing className="h-5 w-5 text-brand" />
                Notifications
              </DialogTitle>
              <p className="mt-1 text-sm text-ink-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? '' : 's'
                    }`
                  : 'All caught up'}
              </p>
            </div>

            <span className="h-10 w-10" aria-hidden />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={notifications.length === 0}
              onClick={clearNotifications}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
            {unreadCount > 0 && (
              <Badge variant="brand" size="sm">
                {unreadCount} unread
              </Badge>
            )}
          </div>

          <div
            className="mt-4 flex gap-1 overflow-x-auto rounded-md border border-border bg-surface-card p-1"
            role="tablist"
            aria-label="Notification filters"
          >
            {filters.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    'shrink-0 rounded-sm px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-brand-subtle text-brand-subtle-text'
                      : 'text-ink-muted hover:bg-surface-sunken hover:text-foreground',
                  )}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth [scrollbar-color:var(--border-default)_transparent] [scrollbar-width:thin]">
          {notifications.length === 0 ? (
            <div className="p-4">
              <EmptyState
                tone="brand"
                icon={<BellRing className="h-5 w-5" />}
                title="No notifications yet"
                description="Important event, AI, analytics, and participant updates will appear here while you work."
                className="min-h-72 bg-surface-card"
              />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<Megaphone className="h-5 w-5" />}
                title="Nothing in this view"
                description="Try another filter or clear filters to see all notifications."
                className="min-h-64 bg-surface-card"
              />
            </div>
          ) : (
            <div role="list" aria-label="Notifications">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} role="listitem">
                  <NotificationRow notification={notification} now={now} />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
