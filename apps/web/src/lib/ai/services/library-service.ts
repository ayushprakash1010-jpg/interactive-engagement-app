import { type SessionTemplate, type ActivityTemplate, type PromptPreset } from '../types';

export class LibraryService {
  async getSessionTemplates(): Promise<SessionTemplate[]> {
    return [
      {
        id: 'tpl-sess-1',
        type: 'session',
        title: 'All-Hands Meeting v2',
        description: 'A comprehensive 60-minute all-hands template featuring leadership updates and an extended Q&A.',
        audience: 'Internal Employees',
        duration: '60m',
        category: 'Leadership',
        tags: ['All Hands', 'Company', 'Q&A'],
        difficulty: 'All',
        createdBy: 'Pulse Templates',
        createdDate: '2026-07-01',
        version: 2,
        usageCount: 1450,
        isFavorite: true,
        plan: {
          id: 'plan-ah-1',
          title: 'All-Hands Meeting',
          objective: 'Company update and Q&A',
          audience: 'Internal Employees',
          eventType: 'Town Hall',
          duration: '60m',
          tone: 'Professional and Transparent',
          estimatedEngagement: 92,
          planningConfidence: 'High',
          durationFit: 95,
          interactionVariety: 'Excellent',
          agenda: [
            { id: 'item-1', timeOffsetMinutes: 0, title: 'Welcome & Icebreaker', durationMinutes: 5, purpose: 'intro' },
            { id: 'item-2', timeOffsetMinutes: 5, title: 'CEO Update', durationMinutes: 20, purpose: 'content' },
            { id: 'item-3', timeOffsetMinutes: 25, title: 'Pulse Check Survey', durationMinutes: 5, purpose: 'assessment', activityId: 'act-survey-1' },
            { id: 'item-4', timeOffsetMinutes: 30, title: 'Product Roadmap', durationMinutes: 15, purpose: 'content' },
            { id: 'item-5', timeOffsetMinutes: 45, title: 'Townhall Q&A', durationMinutes: 12, purpose: 'engagement', activityId: 'act-qna-1' },
            { id: 'item-6', timeOffsetMinutes: 57, title: 'Wrap-up', durationMinutes: 3, purpose: 'closing' }
          ],
          recommendations: []
        }
      },
      {
        id: 'tpl-sess-2',
        type: 'session',
        title: 'Sprint Retrospective',
        description: 'Standard agile retrospective focusing on continuous improvement and team health.',
        audience: 'Engineering Team',
        duration: '45m',
        category: 'Engineering',
        tags: ['Agile', 'Scrum', 'Team Health'],
        difficulty: 'Beginner',
        createdBy: 'Engineering Org',
        createdDate: '2026-06-15',
        version: 1,
        usageCount: 890,
        isFavorite: false,
        plan: {
          id: 'plan-retro-1',
          title: 'Sprint Retrospective',
          objective: 'Reflect on the past sprint and identify improvements',
          audience: 'Engineering Team',
          eventType: 'Meeting',
          duration: '45m',
          tone: 'Collaborative',
          estimatedEngagement: 88,
          planningConfidence: 'High',
          durationFit: 90,
          interactionVariety: 'Good',
          agenda: [
            { id: 'item-1', timeOffsetMinutes: 0, title: 'Sprint Review', durationMinutes: 10, purpose: 'intro' },
            { id: 'item-2', timeOffsetMinutes: 10, title: 'What Went Well (Wordcloud)', durationMinutes: 5, purpose: 'engagement', activityId: 'act-wc-1' },
            { id: 'item-3', timeOffsetMinutes: 15, title: 'What Could Be Improved', durationMinutes: 20, purpose: 'content' },
            { id: 'item-4', timeOffsetMinutes: 35, title: 'Action Items Poll', durationMinutes: 5, purpose: 'assessment', activityId: 'act-poll-1' },
            { id: 'item-5', timeOffsetMinutes: 40, title: 'Closing', durationMinutes: 5, purpose: 'closing' }
          ],
          recommendations: []
        }
      }
    ];
  }

  async getActivityTemplates(): Promise<ActivityTemplate[]> {
    return [
      {
        id: 'tpl-act-1',
        type: 'activity',
        title: 'Mid-Session Pulse Check',
        description: 'A quick survey to gauge if the audience is following the material.',
        audience: 'General',
        duration: '5m',
        category: 'Assessment',
        tags: ['Check-in', 'Survey'],
        difficulty: 'Beginner',
        createdBy: 'Pulse Templates',
        createdDate: '2026-05-10',
        version: 1,
        usageCount: 3400,
        isFavorite: true,
        activity: {
          id: 'draft-pulse-1',
          type: 'survey',
          title: 'Mid-Session Pulse Check',
          description: 'A 2-question check-in.',
          config: {}
        }
      },
      {
        id: 'tpl-act-2',
        type: 'activity',
        title: 'Icebreaker Word Cloud',
        description: 'Ask the audience a fun question to build a word cloud.',
        audience: 'General',
        duration: '3m',
        category: 'Icebreaker',
        tags: ['Fun', 'Visual'],
        difficulty: 'Beginner',
        createdBy: 'Community',
        createdDate: '2026-06-20',
        version: 3,
        usageCount: 5200,
        isFavorite: false,
        activity: {
          id: 'draft-wc-2',
          type: 'wordcloud',
          title: 'Icebreaker Word Cloud',
          description: 'What is one word to describe your week?',
          config: {}
        }
      }
    ];
  }

  async getPromptPresets(): Promise<PromptPreset[]> {
    return [
      {
        id: 'preset-1',
        title: 'Interactive Sales Pitch',
        description: 'Generate a highly engaging sales presentation.',
        category: 'Sales',
        prompt: 'Create a 30-minute interactive sales pitch for a new B2B software product. Include an introductory poll about their current pain points, a mid-session Q&A, and a closing feedback survey.'
      },
      {
        id: 'preset-2',
        title: 'Leadership Workshop',
        description: 'A 90-minute deep dive on team management.',
        category: 'Training',
        prompt: 'Design a 90-minute leadership training workshop. It must include varied interactions: 2 quizzes to test concepts, a word cloud for brainstorming, and a long Q&A block at the end. Tone should be professional and educational.'
      }
    ];
  }
}
