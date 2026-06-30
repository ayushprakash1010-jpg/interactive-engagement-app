'use client';

import * as React from 'react';
import type { EventSettings } from '@iep/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { Select } from '@/components/ui/select';

export interface EventFormValues {
  name: string;
  description: string;
  settings: EventSettings;
  scheduledStart?: string;
  scheduledEnd?: string;
  timezone?: string;
}

const DEFAULT_SETTINGS: EventSettings = {
  allowAnonymousQA: false,
  requireModeration: false,
  participantNames: true,
};

const SETTING_LABELS: Record<
  keyof EventSettings,
  { label: string; hint: string }
> = {
  allowAnonymousQA: {
    label: 'Allow anonymous Q&A',
    hint: 'Participants can ask questions without giving a name.',
  },
  requireModeration: {
    label: 'Require moderation',
    hint: 'Hold questions until you approve them before they appear.',
  },
  participantNames: {
    label: 'Ask for participant names',
    hint: 'Prompt participants for a display name when they join.',
  },
};

const DEFAULT_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const TIMEZONES = Array.from(
  new Set([
    DEFAULT_TZ,
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]),
);

export function EventForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<EventFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: EventFormValues) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = React.useState(defaultValues?.name ?? '');
  const [description, setDescription] = React.useState(
    defaultValues?.description ?? '',
  );
  const [settings, setSettings] = React.useState<EventSettings>({
    ...DEFAULT_SETTINGS,
    ...defaultValues?.settings,
  });

  const [isScheduled, setIsScheduled] = React.useState(
    !!defaultValues?.scheduledStart,
  );

  const now = new Date();
  const later = new Date(now.getTime() + 30 * 60000);

  const [startDate, setStartDate] = React.useState(
    defaultValues?.scheduledStart
      ? new Date(defaultValues.scheduledStart).toISOString().split('T')[0]
      : now.toISOString().split('T')[0],
  );
  const [startTime, setStartTime] = React.useState(
    defaultValues?.scheduledStart
      ? new Date(defaultValues.scheduledStart).toTimeString().slice(0, 5)
      : now.toTimeString().slice(0, 5),
  );

  const [endDate, setEndDate] = React.useState(
    defaultValues?.scheduledEnd
      ? new Date(defaultValues.scheduledEnd).toISOString().split('T')[0]
      : later.toISOString().split('T')[0],
  );
  const [endTime, setEndTime] = React.useState(
    defaultValues?.scheduledEnd
      ? new Date(defaultValues.scheduledEnd).toTimeString().slice(0, 5)
      : later.toTimeString().slice(0, 5),
  );

  const [timezone, setTimezone] = React.useState(
    defaultValues?.timezone ?? DEFAULT_TZ,
  );

  const trimmedName = name.trim();
  
  // Date validation
  const startDt = new Date(`${startDate}T${startTime}`);
  const endDt = new Date(`${endDate}T${endTime}`);
  const isDateValid = !isScheduled || endDt > startDt;

  const canSubmit = trimmedName.length > 0 && isDateValid && !isSubmitting;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          name: trimmedName,
          description: description.trim(),
          settings,
          scheduledStart: isScheduled ? startDt.toISOString() : undefined,
          scheduledEnd: isScheduled ? endDt.toISOString() : undefined,
          timezone: isScheduled ? timezone : undefined,
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="event-name">Name</Label>
        <Input
          id="event-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Q3 All-Hands"
          maxLength={200}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional context shown to your team."
          maxLength={2000}
        />
      </div>

      <fieldset className="space-y-4 rounded-lg border border-border bg-surface-sunken p-4">
        <div className="flex items-center justify-between">
          <legend className="px-1 text-2xs font-semibold uppercase tracking-wider text-brand">
            Schedule
          </legend>
          <Switch
            checked={isScheduled}
            onCheckedChange={setIsScheduled}
            aria-label="Schedule this event"
          />
        </div>
        
        {isScheduled && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
            </div>

            {!isDateValid && (
              <p className="text-sm font-medium text-destructive">
                End time must be after start time.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-border bg-surface-sunken p-4">
        <legend className="px-1 text-2xs font-semibold uppercase tracking-wider text-brand">
          Settings
        </legend>
        {(Object.keys(SETTING_LABELS) as (keyof EventSettings)[]).map((key) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor={`setting-${key}`}>{SETTING_LABELS[key].label}</Label>
              <p className="text-xs text-ink-muted">
                {SETTING_LABELS[key].hint}
              </p>
            </div>
            <Switch
              id={`setting-${key}`}
              checked={settings[key]}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, [key]: checked }))
              }
            />
          </div>
        ))}
      </fieldset>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
