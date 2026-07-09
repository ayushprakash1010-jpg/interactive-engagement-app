import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Input, Label, Select, Textarea } from '@/components/ui';

export type SessionConfigState = {
  title: string;
  description: string;
  audienceType: string;
  eventType: string;
  duration: string;
  expectedParticipants: string;
  tone: string;
  language: string;
};

export function SessionConfigurationPanel({
  config,
  onChange,
}: {
  config: SessionConfigState;
  onChange: (updates: Partial<SessionConfigState>) => void;
}) {
  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg">Session Configuration</CardTitle>
        <CardDescription>Define the parameters for your AI generated activities.</CardDescription>
      </CardHeader>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="session-title">Session Title</Label>
          <Input 
            id="session-title" 
            placeholder="e.g. Q3 All-Hands Kickoff" 
            value={config.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="session-desc">Description</Label>
          <Textarea 
            id="session-desc" 
            placeholder="What is the main goal of this session?" 
            className="resize-none h-20"
            value={config.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select
              id="event-type"
              value={config.eventType}
              onChange={(e) => onChange({ eventType: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="meeting">Meeting</option>
              <option value="lecture">Lecture</option>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audience-type">Audience Type</Label>
            <Select
              id="audience-type"
              value={config.audienceType}
              onChange={(e) => onChange({ audienceType: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="internal">Internal Team</option>
              <option value="external">External Clients</option>
              <option value="students">Students</option>
              <option value="public">General Public</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              id="duration"
              value={config.duration}
              onChange={(e) => onChange({ duration: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="2h+">2+ Hours</option>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="participants">Participants</Label>
            <Input 
              id="participants" 
              type="number" 
              placeholder="e.g. 50" 
              value={config.expectedParticipants}
              onChange={(e) => onChange({ expectedParticipants: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              id="tone"
              value={config.tone}
              onChange={(e) => onChange({ tone: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="fun">Fun & Interactive</option>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              id="language"
              value={config.language}
              onChange={(e) => onChange({ language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
