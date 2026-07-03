import {
  type CreateActivityPayload,
} from '@/hooks/use-activities';
import type { EventSettings } from '@iep/types';
import { ALL_TEMPLATES } from './templates-data';

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  estimatedDuration: string;
  recommendedAudience: string;
  difficulty?: 'Quick' | 'Standard' | 'Workshop';
  tags?: string[];
  featured?: boolean;
  settings: Partial<EventSettings>;
  categories: string[];
  activities: CreateActivityPayload[];
  objectives?: string[];
  expectedOutcomes?: string[];
  suggestedFlow?: { time: string, description: string }[];
}

export const EVENT_TEMPLATES: EventTemplate[] = ALL_TEMPLATES;
