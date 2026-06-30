'use client';

import * as React from 'react';

export type NotificationType =
  | 'event-created'
  | 'event-deleted'
  | 'poll-launched'
  | 'poll-closed'
  | 'quiz-launched'
  | 'quiz-finished'
  | 'wordcloud-launched'
  | 'feedback-launched'
  | 'ai-poll-generated'
  | 'ai-quiz-generated'
  | 'ai-feedback-generated'
  | 'ai-reply-generated'
  | 'ai-summary-completed'
  | 'ai-report-completed'
  | 'analytics-export-started'
  | 'analytics-export-completed'
  | 'session-ended'
  | 'participant-joined'
  | 'participant-milestone'
  | 'event-scheduled'
  | 'event-starts-soon'
  | 'event-scheduled-live'
  | 'event-scheduled-ended';

export type NotificationTone = 'success' | 'info' | 'warning' | 'ai' | 'brand';
export type NotificationCategory =
  | 'success'
  | 'ai'
  | 'event'
  | 'analytics'
  | 'session'
  | 'participant'
  | 'warning'
  | 'error';

export type NotificationDownload = {
  path: string;
  filename: string;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  tone: NotificationTone;
  category: NotificationCategory;
  count: number;
  groupKey?: string;
  href?: string;
  download?: NotificationDownload;
};

type NotificationInput = {
  type: NotificationType;
  title?: string;
  description?: string;
  href?: string;
  download?: NotificationDownload;
  groupKey?: string;
};

type State = {
  notifications: Notification[];
};

const STORAGE_KEY = 'iep:notifications:v1';
const MAX_NOTIFICATIONS = 50;
const EMPTY_STATE: State = { notifications: [] };

const listeners = new Set<() => void>();
let state: State = { notifications: [] };
let hydrated = false;

const catalog: Record<
  NotificationType,
  {
    title: string;
    description: string;
    tone: NotificationTone;
    category: NotificationCategory;
  }
> = {
  'event-scheduled': {
    title: 'Event Scheduled',
    description: 'A new scheduled event was created.',
    tone: 'success',
    category: 'event',
  },
  'event-starts-soon': {
    title: 'Event Starts Soon',
    description: 'An upcoming event starts in 30 minutes.',
    tone: 'info',
    category: 'event',
  },
  'event-scheduled-live': {
    title: 'Event is Live',
    description: 'Your scheduled event is now active.',
    tone: 'brand',
    category: 'event',
  },
  'event-scheduled-ended': {
    title: 'Event Ended',
    description: 'Your scheduled event has ended.',
    tone: 'info',
    category: 'event',
  },
  'event-created': {
    title: 'Event Created',
    description: 'A new event was created.',
    tone: 'success',
    category: 'event',
  },
  'event-deleted': {
    title: 'Event Deleted',
    description: 'An event was deleted.',
    tone: 'warning',
    category: 'warning',
  },
  'poll-launched': {
    title: 'Poll Launched',
    description: 'A poll is now live.',
    tone: 'info',
    category: 'event',
  },
  'poll-closed': {
    title: 'Poll Closed',
    description: 'The poll was closed.',
    tone: 'warning',
    category: 'warning',
  },
  'quiz-launched': {
    title: 'Quiz Launched',
    description: 'A quiz is now live.',
    tone: 'info',
    category: 'event',
  },
  'quiz-finished': {
    title: 'Quiz Finished',
    description: 'The quiz was closed.',
    tone: 'success',
    category: 'success',
  },
  'wordcloud-launched': {
    title: 'Word Cloud Launched',
    description: 'A word cloud is now live.',
    tone: 'brand',
    category: 'event',
  },
  'feedback-launched': {
    title: 'Feedback Launched',
    description: 'A feedback form is now live.',
    tone: 'brand',
    category: 'event',
  },
  'ai-poll-generated': {
    title: 'AI Poll Generated',
    description: 'AI generated a poll successfully.',
    tone: 'ai',
    category: 'ai',
  },
  'ai-quiz-generated': {
    title: 'AI Quiz Generated',
    description: 'AI generated a quiz successfully.',
    tone: 'ai',
    category: 'ai',
  },
  'ai-feedback-generated': {
    title: 'AI Feedback Generated',
    description: 'AI generated feedback successfully.',
    tone: 'ai',
    category: 'ai',
  },
  'ai-reply-generated': {
    title: 'AI Reply Generated',
    description: 'AI generated a reply successfully.',
    tone: 'ai',
    category: 'ai',
  },
  'ai-summary-completed': {
    title: 'AI Summary Completed',
    description: 'AI completed the session summary.',
    tone: 'ai',
    category: 'ai',
  },
  'ai-report-completed': {
    title: 'AI Report Completed',
    description: 'AI completed the session report.',
    tone: 'ai',
    category: 'ai',
  },
  'analytics-export-started': {
    title: 'Analytics Export Started',
    description: 'Your analytics export is being prepared.',
    tone: 'info',
    category: 'analytics',
  },
  'analytics-export-completed': {
    title: 'Analytics Export Completed',
    description: 'Your analytics export is ready.',
    tone: 'success',
    category: 'analytics',
  },
  'session-ended': {
    title: 'Session Ended',
    description: 'The session ended and analytics are available.',
    tone: 'warning',
    category: 'session',
  },
  'participant-joined': {
    title: 'Participant Joined',
    description: 'A new participant joined the session.',
    tone: 'info',
    category: 'participant',
  },
  'participant-milestone': {
    title: 'Participant Milestone',
    description: 'A participant milestone was reached.',
    tone: 'success',
    category: 'participant',
  },
};

const groupableTypes = new Set<NotificationType>([
  'participant-joined',
  'ai-poll-generated',
  'ai-quiz-generated',
  'ai-feedback-generated',
  'ai-reply-generated',
  'ai-summary-completed',
  'ai-report-completed',
  'analytics-export-completed',
]);

const toastTitleMap: Record<string, NotificationType> = {
  'Event deleted': 'event-deleted',
  'Session ended': 'session-ended',
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function isNotification(value: unknown): value is Notification {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<Notification>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.timestamp === 'string' &&
    typeof item.read === 'boolean' &&
    typeof item.type === 'string'
  );
}

function normalizeNotification(value: Notification): Notification {
  const defaults = catalog[value.type];

  return {
    ...value,
    tone: value.tone ?? defaults?.tone ?? 'info',
    category: value.category ?? defaults?.category ?? 'event',
    count: value.count ?? 1,
  };
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;

  hydrated = true;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    state = {
      notifications: parsed
        .filter(isNotification)
        .map(normalizeNotification)
        .slice(0, MAX_NOTIFICATIONS),
    };
  } catch {
    state = { notifications: [] };
  }
}

function persist() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state.notifications),
    );
  } catch {
    // Session persistence is best-effort only.
  }
}

function setState(next: State) {
  state = next;
  persist();
  emitChange();
}

function getSnapshot() {
  hydrate();
  return state;
}

function getServerSnapshot() {
  return EMPTY_STATE;
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function groupTitle(type: NotificationType, count: number, fallback: string) {
  if (count <= 1) return fallback;

  switch (type) {
    case 'participant-joined':
      return `${count} participants joined recently`;
    case 'ai-poll-generated':
      return `${count} AI polls generated recently`;
    case 'ai-quiz-generated':
      return `${count} AI quizzes generated recently`;
    case 'ai-feedback-generated':
      return `${count} AI feedback drafts generated recently`;
    case 'ai-reply-generated':
      return `${count} AI replies generated recently`;
    case 'ai-summary-completed':
      return `${count} AI summaries completed recently`;
    case 'ai-report-completed':
      return `${count} AI reports completed recently`;
    case 'analytics-export-completed':
      return `${count} analytics exports completed recently`;
    default:
      return fallback;
  }
}

function groupKeyFor(input: { type: NotificationType; groupKey?: string }) {
  return input.groupKey ?? input.type;
}

export function notify(input: NotificationInput) {
  hydrate();

  const defaults = catalog[input.type] || {
    title: 'Notification',
    description: '',
    tone: 'info',
    category: 'info',
  };
  const groupKey = groupKeyFor(input);

  if (groupableTypes.has(input.type)) {
    const existingIndex = state.notifications.findIndex(
      (notification) =>
        notification.type === input.type &&
        groupKeyFor(notification) === groupKey,
    );

    if (existingIndex >= 0) {
      const existing = state.notifications[existingIndex];
      if (!existing) return;

      const nextCount = (existing.count ?? 1) + 1;
      const updated: Notification = {
        ...existing,
        title: groupTitle(input.type, nextCount, input.title ?? defaults.title),
        description: input.description ?? defaults.description,
        timestamp: new Date().toISOString(),
        read: false,
        count: nextCount,
        groupKey,
        href: input.href ?? existing.href,
        download: input.download ?? existing.download,
      };
      const nextNotifications = [
        updated,
        ...state.notifications.filter((_, index) => index !== existingIndex),
      ].slice(0, MAX_NOTIFICATIONS);

      setState({ notifications: nextNotifications });
      return;
    }
  }

  const notification: Notification = {
    id: createId(),
    type: input.type,
    title: input.title ?? defaults.title,
    description: input.description ?? defaults.description,
    timestamp: new Date().toISOString(),
    read: false,
    tone: defaults.tone,
    category: defaults.category,
    count: 1,
    groupKey,
    href: input.href,
    download: input.download,
  };

  setState({
    notifications: [notification, ...state.notifications].slice(
      0,
      MAX_NOTIFICATIONS,
    ),
  });
}

export function notifyFromToast(input: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: string | null;
}) {
  if (input.variant === 'destructive' || typeof input.title !== 'string') {
    return;
  }

  const type = toastTitleMap[input.title];
  if (!type) return;

  notify({
    type,
    description:
      typeof input.description === 'string'
        ? input.description
        : catalog[type].description,
    href: type === 'session-ended' ? inferSessionAnalyticsHref() : undefined,
  });
}

function inferSessionAnalyticsHref() {
  if (typeof window === 'undefined') return undefined;

  const match = window.location.pathname.match(/^\/dashboard\/events\/([^/]+)/);
  return match ? `/dashboard/events/${match[1]}/analytics` : undefined;
}

export function markNotificationRead(id: string) {
  hydrate();
  setState({
    notifications: state.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    ),
  });
}

export function markAllNotificationsRead() {
  hydrate();
  setState({
    notifications: state.notifications.map((notification) => ({
      ...notification,
      read: true,
    })),
  });
}

export function clearNotifications() {
  hydrate();
  setState({ notifications: [] });
}

export function dismissNotification(id: string) {
  hydrate();
  setState({
    notifications: state.notifications.filter(
      (notification) => notification.id !== id,
    ),
  });
}

export function useNotifications() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
