'use client';

import * as React from 'react';
import {
  Bell,
  Check,
  Clock,
  Globe2,
  LockKeyhole,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
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
  Input,
  Label,
  PageHeader,
  SectionHeader,
  Select,
  SurfacePanel,
  Switch,
} from '@/components/ui';
import { useAuth } from '@/lib/use-auth';
import { useTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

type SectionId =
  | 'profile'
  | 'appearance'
  | 'preferences'
  | 'notifications'
  | 'security'
  | 'ai';

const SECTION_NAV: Array<{
  id: SectionId;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Identity and workspace role',
    icon: UserRound,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Theme and interface',
    icon: Palette,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Locale and formatting',
    icon: Globe2,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email and activity updates',
    icon: Bell,
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Session and sign-in',
    icon: LockKeyhole,
  },
  {
    id: 'ai',
    label: 'AI Preferences',
    description: 'Generation defaults',
    icon: Sparkles,
  },
];

const THEME_OPTIONS: Array<{
  value: Theme;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces and high-contrast controls.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Reduced glare for sessions and late work.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow your operating system preference.',
    icon: Monitor,
  },
];

const localStorageKey = 'iep-settings-preferences';

type LocalSettings = {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  aiModel: string;
  aiTone: string;
  creativity: string;
  responseLength: string;
};

const defaultLocalSettings: LocalSettings = {
  timezone: 'Asia/Kolkata',
  dateFormat: 'MMM D, YYYY',
  timeFormat: '12h',
  aiModel: 'default',
  aiTone: 'balanced',
  creativity: 'balanced',
  responseLength: 'medium',
};

const NOTIFICATION_SETTINGS = [
  ['Email notifications', 'Product and workspace activity updates.'],
  ['Event reminders', 'Before live sessions start.'],
  ['Weekly reports', 'A digest of event engagement and outcomes.'],
  ['AI generation completed', 'When long-running AI work is ready.'],
] satisfies Array<[string, string]>;

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ComingSoonBadge() {
  return (
    <Badge variant="neutral" size="sm">
      Coming Soon
    </Badge>
  );
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
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex-row items-start gap-3 space-y-0 p-5">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary">
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
            {badge}
          </div>
          <CardDescription className="leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">{children}</CardContent>
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
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {badge}
        </div>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      <div className="w-full sm:w-auto">{children}</div>
    </div>
  );
}

function Field({
  children,
  hint,
  label,
}: {
  children: React.ReactNode;
  hint?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logoutUrl } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [settings, setSettings] =
    React.useState<LocalSettings>(defaultLocalSettings);
  const [savedState, setSavedState] = React.useState<'saved' | 'saving'>('saved');

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(localStorageKey);
      if (!stored) return;
      setSettings({
        ...defaultLocalSettings,
        ...(JSON.parse(stored) as Partial<LocalSettings>),
      });
    } catch {
      setSettings(defaultLocalSettings);
    }
  }, []);

  const updateSetting = <Key extends keyof LocalSettings>(
    key: Key,
    value: LocalSettings[Key],
  ) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      setSavedState('saving');
      window.localStorage.setItem(localStorageKey, JSON.stringify(next));
      window.setTimeout(() => setSavedState('saved'), 450);
      return next;
    });
  };

  const displayName = user?.name ?? user?.email ?? 'Your account';
  const email = user?.email ?? 'No email available';
  const picture = typeof user?.picture === 'string' ? user.picture : undefined;
  const provider =
    typeof user?.sub === 'string' && user.sub.includes('|')
      ? user.sub.split('|')[0]
      : 'Auth0';

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage your profile, preferences, security posture, and AI defaults from one focused workspace."
        actions={
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-card px-3 py-2 text-sm text-ink-secondary shadow-xs">
            {savedState === 'saving' ? (
              <Save className="h-4 w-4 text-brand" />
            ) : (
              <Check className="h-4 w-4 text-success" />
            )}
            {savedState === 'saving' ? 'Saving locally...' : 'Local preferences saved'}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SurfacePanel className="space-y-2 p-3">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Settings
            </p>
            <nav aria-label="Settings sections" className="space-y-1">
              {SECTION_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted group-hover:text-foreground" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {item.description}
                      </span>
                    </span>
                  </a>
                );
              })}
            </nav>
          </SurfacePanel>
        </aside>

        <div className="min-w-0 space-y-8">
          <section id="profile" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Profile"
              description="Your identity is currently supplied by Auth0. Editing controls are shown for product direction and are not connected to a backend yet."
            />
            <SettingsCard
              title="Personal information"
              description="Displayed across the host dashboard and event ownership surfaces."
              icon={<UserRound className="h-5 w-5" />}
              badge={<ComingSoonBadge />}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-subtle font-display text-xl font-bold text-brand">
                  {picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={picture}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initialsFor(displayName) || <UserRound className="h-7 w-7" />
                  )}
                </div>
                <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" hint="Profile editing is coming soon.">
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
                          : 'border-border bg-surface-card hover:bg-surface-sunken',
                      )}
                      aria-pressed={active}
                      onClick={() => setTheme(option.value)}
                    >
                      <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-card text-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="block text-sm font-semibold">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs text-ink-muted">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
              <SettingRow
                label="Accent color"
                description="Custom brand accents for workspaces are planned."
                badge={<ComingSoonBadge />}
              >
                <Button type="button" variant="outline" disabled>
                  Configure
                </Button>
              </SettingRow>
              <SettingRow
                label="Compact mode"
                description="A denser dashboard layout for power users."
                badge={<ComingSoonBadge />}
              >
                <Switch disabled aria-label="Compact mode coming soon" />
              </SettingRow>
            </SettingsCard>
          </section>

          <section id="preferences" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Preferences"
              description="These defaults are stored locally until workspace preference persistence exists."
            />
            <SettingsCard
              title="Locale defaults"
              description="Control how dates and times appear in your dashboard experience."
              icon={<Clock className="h-5 w-5" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Timezone">
                  <Select
                    value={settings.timezone}
                    onChange={(event) =>
                      updateSetting('timezone', event.target.value)
                    }
                    aria-label="Timezone"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="America/Los_Angeles">
                      America/Los Angeles
                    </option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </Field>
                <Field label="Date format">
                  <Select
                    value={settings.dateFormat}
                    onChange={(event) =>
                      updateSetting('dateFormat', event.target.value)
                    }
                    aria-label="Date format"
                  >
                    <option value="MMM D, YYYY">Jun 27, 2026</option>
                    <option value="D MMM YYYY">27 Jun 2026</option>
                    <option value="YYYY-MM-DD">2026-06-27</option>
                    <option value="MM/DD/YYYY">06/27/2026</option>
                  </Select>
                </Field>
                <Field label="Time format">
                  <Select
                    value={settings.timeFormat}
                    onChange={(event) =>
                      updateSetting(
                        'timeFormat',
                        event.target.value as LocalSettings['timeFormat'],
                      )
                    }
                    aria-label="Time format"
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </Select>
                </Field>
                <Field label="Language" hint="Workspace language support is coming soon.">
                  <Select value="en" disabled aria-label="Language coming soon">
                    <option value="en">English</option>
                  </Select>
                </Field>
              </div>
            </SettingsCard>
          </section>

          <section id="notifications" className="scroll-mt-24 space-y-4">
            <SectionHeader
              title="Notifications"
              description="Notification persistence is not available yet, so controls are intentionally disabled."
            />
            <SettingsCard
              title="Notification channels"
              description="A future home for email, reminder, report, and AI completion preferences."
              icon={<Bell className="h-5 w-5" />}
              badge={<ComingSoonBadge />}
            >
              {NOTIFICATION_SETTINGS.map(([label, description]) => (
                <SettingRow
                  key={label}
                  label={label}
                  description={description}
                  badge={<ComingSoonBadge />}
                >
                  <Switch disabled aria-label={`${label} coming soon`} />
                </SettingRow>
              ))}
            </SettingsCard>
          </section>

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
                <SurfacePanel tone="sunken" className="space-y-1 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Authentication provider
                  </p>
                  <p className="text-sm font-semibold text-foreground">Auth0</p>
                </SurfacePanel>
                <SurfacePanel tone="sunken" className="space-y-1 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Connected login
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {provider}
                  </p>
                </SurfacePanel>
              </div>
              <SettingRow
                label="Current session"
                description={`Signed in as ${email}.`}
              >
                <Button asChild variant="outline">
                  <a href={logoutUrl}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </a>
                </Button>
              </SettingRow>
              <SettingRow
                label="Two-factor authentication"
                description="Additional verification is planned for account security."
                badge={<ComingSoonBadge />}
              >
                <Switch disabled aria-label="Two-factor authentication coming soon" />
              </SettingRow>
            </SettingsCard>
          </section>

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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred AI model" hint="Stored locally only.">
                  <Select
                    value={settings.aiModel}
                    onChange={(event) =>
                      updateSetting('aiModel', event.target.value)
                    }
                    aria-label="Preferred AI model"
                  >
                    <option value="default">Pulse default</option>
                    <option value="fast">Fast drafting</option>
                    <option value="deep">Deeper reasoning</option>
                  </Select>
                </Field>
                <Field label="Response tone" hint="Stored locally only.">
                  <Select
                    value={settings.aiTone}
                    onChange={(event) =>
                      updateSetting('aiTone', event.target.value)
                    }
                    aria-label="Response tone"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="concise">Concise</option>
                    <option value="facilitative">Facilitative</option>
                    <option value="executive">Executive</option>
                  </Select>
                </Field>
                <Field label="Creativity" hint="Stored locally only.">
                  <Select
                    value={settings.creativity}
                    onChange={(event) =>
                      updateSetting('creativity', event.target.value)
                    }
                    aria-label="Creativity"
                  >
                    <option value="focused">Focused</option>
                    <option value="balanced">Balanced</option>
                    <option value="exploratory">Exploratory</option>
                  </Select>
                </Field>
                <Field label="Response length" hint="Stored locally only.">
                  <Select
                    value={settings.responseLength}
                    onChange={(event) =>
                      updateSetting('responseLength', event.target.value)
                    }
                    aria-label="Response length"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </Select>
                </Field>
              </div>
              <SurfacePanel tone="ai" className="flex items-start gap-3 p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
                <p className="text-sm text-ai-subtle-text">
                  These controls do not modify AI Studio requests yet. They are
                  kept local so the settings experience is usable without
                  inventing new backend contracts.
                </p>
              </SurfacePanel>
            </SettingsCard>
          </section>

          <SurfacePanel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Settings persistence
              </p>
              <p className="text-sm text-ink-muted">
                Theme uses the existing provider. Locale and AI preference
                controls are currently saved in this browser only.
              </p>
            </div>
            <Badge variant="info" dot>
              No new APIs
            </Badge>
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}
