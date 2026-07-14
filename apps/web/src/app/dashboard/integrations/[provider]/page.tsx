'use client';

import * as React from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui';
import {
  ZoomIcon,
  TeamsIcon,
  PowerPointIcon,
  GoogleSlidesIcon,
  GoogleMeetIcon,
} from '@/components/brand-icons';
import { CheckCircle2, Link as LinkIcon, ExternalLink } from 'lucide-react';

type ProviderConfig = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: { title: string; description: string }[];
  buttonText: string;
  actionEndpoint?: string;
  href?: string;
};

const PROVIDERS: Record<string, ProviderConfig> = {
  zoom: {
    id: 'zoom',
    title: 'Slido for Zoom',
    description: 'Run polls and Q&A directly inside your Zoom meetings without participants ever leaving the window.',
    icon: ZoomIcon,
    steps: [
      { title: 'Connect Account', description: 'Click the button below to authorize Pulse with your Zoom account.' },
      { title: 'Launch Meeting', description: 'Start your Zoom meeting and open the Apps tray.' },
      { title: 'Select Pulse', description: 'Launch the Pulse app and select your live event.' },
    ],
    buttonText: 'Connect Zoom',
    actionEndpoint: 'api/zoom/authorize',
  },
  teams: {
    id: 'teams',
    title: 'Slido for Microsoft Teams',
    description: 'Embed live polls and Q&A as a seamless meeting side panel in Microsoft Teams.',
    icon: TeamsIcon,
    steps: [
      { title: 'Connect Account', description: 'Link your Microsoft account to Pulse.' },
      { title: 'Add to Meeting', description: 'Add the Pulse app to your Teams meeting invite.' },
      { title: 'Present', description: 'Open the side panel during your call to launch polls.' },
    ],
    buttonText: 'Connect Teams',
    actionEndpoint: 'api/teams/authorize',
  },
  'google-meet': {
    id: 'google-meet',
    title: 'Slido for Google Meet',
    description: 'Run polls and Q&A using the native Google Meet Add-on sidebar.',
    icon: GoogleMeetIcon,
    steps: [
      { title: 'Connect Account', description: 'Authorize Pulse to link Meet sessions automatically.' },
      { title: 'Open Activities', description: 'Click the Activities icon (shapes) in Google Meet.' },
      { title: 'Select Pulse', description: 'Choose Pulse to open the interactive sidebar.' },
    ],
    buttonText: 'Connect Google Meet',
    actionEndpoint: 'api/google-meet/authorize',
  },
  powerpoint: {
    id: 'powerpoint',
    title: 'Slido for PowerPoint',
    description: 'Embed live polls and Q&A as a task pane inside Microsoft PowerPoint presentations.',
    icon: PowerPointIcon,
    steps: [
      { title: 'Connect Account', description: 'Link your Microsoft account to Pulse.' },
      { title: 'Sideload Add-in', description: 'Install the manifest.xml file into PowerPoint.' },
      { title: 'Link Presentation', description: 'Enter your Event Code directly in the PowerPoint task pane.' },
    ],
    buttonText: 'Connect PowerPoint',
    actionEndpoint: 'api/powerpoint/authorize',
  },
  'google-slides': {
    id: 'google-slides',
    title: 'Slido for Google Slides',
    description: 'Embed live polls and Q&A as a custom sidebar inside Google Slides presentations via Apps Script.',
    icon: GoogleSlidesIcon,
    steps: [
      { title: 'Get the Code', description: 'Click below to view the Apps Script source code.' },
      { title: 'Paste into Apps Script', description: 'In Google Slides, go to Extensions > Apps Script and paste the files.' },
      { title: 'Run Add-on', description: 'Refresh your presentation and open the new Pulse sidebar.' },
    ],
    buttonText: 'Get Add-on Code',
    href: 'https://github.com/ayushprakash1010-jpg/interactive-engagement-app/tree/google-slides-integration/integrations/google-slides',
  },
};

export default function IntegrationPage({ params }: { params: { provider: string } }) {
  const provider = PROVIDERS[params.provider];

  if (!provider) {
    notFound();
  }

  const Icon = provider.icon;

  const handleAction = async () => {
    if (provider.href) {
      window.open(provider.href, '_blank');
      return;
    }

    if (provider.actionEndpoint) {
      try {
        const { apiFetch } = await import('@/lib/events-api');
        const data = await apiFetch<{ url: string }>(provider.actionEndpoint);
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        console.error(`Failed to initiate ${provider.title} connection`, data);
      } catch (e) {
        console.error(`Failed to connect ${provider.title}`, e);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-base p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-24 w-24 rounded-2xl bg-surface-card border border-border shadow-sm flex items-center justify-center p-4">
            <Icon className="h-full w-full" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
              {provider.title}
            </h1>
            <p className="text-lg text-ink-secondary max-w-xl mx-auto leading-relaxed">
              {provider.description}
            </p>
          </div>

          <Button size="lg" className="mt-4 shadow-sm" onClick={handleAction}>
            {provider.href ? <ExternalLink className="mr-2 h-4 w-4" /> : <LinkIcon className="mr-2 h-4 w-4" />}
            {provider.buttonText}
          </Button>
        </div>

        <hr className="border-border" />

        {/* How it works Section */}
        <div className="space-y-6">
          <SectionHeader
            title="How it works"
            description={`Follow these steps to set up the ${provider.title} integration.`}
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {provider.steps.map((step, index) => (
              <div key={index} className="relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-surface-card shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-subtle text-brand-subtle-text font-semibold text-sm">
                    {index + 1}
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-ink-muted/30" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
