'use client';

import * as React from 'react';
import type { EventSettings } from '@iep/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface EventFormValues {
  name: string;
  description: string;
  settings: EventSettings;
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

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ name: trimmedName, description: description.trim(), settings });
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
