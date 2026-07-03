export * from './icebreakers';
export * from './meetings';
export * from './project-management';
export * from './business';
export * from './education';
export * from './workshops';
export * from './engineering';
export * from './hr';
export * from './marketing';
export * from './sales';
export * from './product';
export * from './conferences';
export * from './events';
export * from './brainstorming';
export * from './leadership';
export * from './research';
export * from './healthcare';
export * from './community';
export * from './fun';
export * from './seasonal';

import type { EventTemplate } from '../templates';

import { ICEBREAKERS_TEMPLATES } from './icebreakers';
import { MEETINGS_TEMPLATES } from './meetings';
import { PROJECT_MANAGEMENT_TEMPLATES } from './project-management';
import { BUSINESS_TEMPLATES } from './business';
import { EDUCATION_TEMPLATES } from './education';
import { WORKSHOPS_TEMPLATES } from './workshops';
import { ENGINEERING_TEMPLATES } from './engineering';
import { HR_TEMPLATES } from './hr';
import { MARKETING_TEMPLATES } from './marketing';
import { SALES_TEMPLATES } from './sales';
import { PRODUCT_TEMPLATES } from './product';
import { CONFERENCES_TEMPLATES } from './conferences';
import { EVENTS_TEMPLATES } from './events';
import { BRAINSTORMING_TEMPLATES } from './brainstorming';
import { LEADERSHIP_TEMPLATES } from './leadership';
import { RESEARCH_TEMPLATES } from './research';
import { HEALTHCARE_TEMPLATES } from './healthcare';
import { COMMUNITY_TEMPLATES } from './community';
import { FUN_TEMPLATES } from './fun';
import { SEASONAL_TEMPLATES } from './seasonal';

export const ALL_TEMPLATES: EventTemplate[] = [
  ...ICEBREAKERS_TEMPLATES,
  ...MEETINGS_TEMPLATES,
  ...PROJECT_MANAGEMENT_TEMPLATES,
  ...BUSINESS_TEMPLATES,
  ...EDUCATION_TEMPLATES,
  ...WORKSHOPS_TEMPLATES,
  ...ENGINEERING_TEMPLATES,
  ...HR_TEMPLATES,
  ...MARKETING_TEMPLATES,
  ...SALES_TEMPLATES,
  ...PRODUCT_TEMPLATES,
  ...CONFERENCES_TEMPLATES,
  ...EVENTS_TEMPLATES,
  ...BRAINSTORMING_TEMPLATES,
  ...LEADERSHIP_TEMPLATES,
  ...RESEARCH_TEMPLATES,
  ...HEALTHCARE_TEMPLATES,
  ...COMMUNITY_TEMPLATES,
  ...FUN_TEMPLATES,
  ...SEASONAL_TEMPLATES
];