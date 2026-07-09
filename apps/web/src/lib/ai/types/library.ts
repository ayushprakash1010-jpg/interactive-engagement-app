import { type SessionPlan, type DraftActivity } from './index';

export type TemplateMetadata = {
  id: string;
  title: string;
  description: string;
  audience: string;
  duration: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All';
  createdBy: string;
  createdDate: string;
  version: number;
  usageCount: number;
  isFavorite: boolean;
  changeNotes?: string;
};

export type SessionTemplate = TemplateMetadata & {
  type: 'session';
  plan: SessionPlan;
};

export type ActivityTemplate = TemplateMetadata & {
  type: 'activity';
  activity: DraftActivity;
};

export type PromptPreset = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
};
