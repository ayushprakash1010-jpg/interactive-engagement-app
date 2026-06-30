import {
  type CreateActivityPayload,
} from '@/hooks/use-activities';
import {
  Coffee,
  GraduationCap,
  RefreshCw,
  Mic,
  Rocket,
  Users,
  Presentation,
  Lightbulb,
  MessageCircleQuestion,
} from 'lucide-react';
import type { EventSettings } from '@iep/types';

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  estimatedDuration: string;
  recommendedAudience: string;
  settings: Partial<EventSettings>;
  categories: string[];
  activities: CreateActivityPayload[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'icebreaker',
    name: 'Icebreaker',
    description: 'Warm up your audience and get to know them before diving into the main content.',
    icon: Coffee,
    estimatedDuration: '10 mins',
    recommendedAudience: 'Any size',
    categories: ['Workshops', 'Business'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'poll',
        title: 'How are you feeling today?',
        config: {
          pollType: 'single',
          question: 'How are you feeling today?',
          options: [
            { id: '1', label: 'Great!' },
            { id: '2', label: 'Good' },
            { id: '3', label: 'Okay' },
            { id: '4', label: 'Could be better' },
          ],
        },
      },
      {
        type: 'wordcloud',
        title: 'Describe your weekend in one word',
        config: {
          prompt: 'Describe your weekend in one word',
          maxWordsPerParticipant: 1,
        },
      },
    ],
  },
  {
    id: 'classroom-quiz',
    name: 'Classroom Quiz',
    description: 'Test knowledge and gather feedback at the end of a lesson.',
    icon: GraduationCap,
    estimatedDuration: '15 mins',
    recommendedAudience: '10-50 people',
    categories: ['Education'],
    settings: {
      allowAnonymousQA: false,
    },
    activities: [
      {
        type: 'quiz',
        title: 'End of Lesson Quiz',
        config: {
          speedBonusEnabled: true,
          questions: [
            {
              id: 'q1',
              text: 'What was the main topic of today’s lesson?',
              options: [
                { id: 'o1', label: 'Topic A' },
                { id: 'o2', label: 'Topic B' },
                { id: 'o3', label: 'Topic C' },
              ],
              correctOptionId: 'o1',
              points: 1000,
              timeLimitSec: 20,
            },
          ],
        },
      },
      {
        type: 'poll',
        title: 'Lesson pacing',
        config: {
          pollType: 'single',
          question: 'How was the pace of today’s lesson?',
          options: [
            { id: '1', label: 'Too fast' },
            { id: '2', label: 'Just right' },
            { id: '3', label: 'Too slow' },
          ],
        },
      },
      {
        type: 'feedback',
        title: 'Lesson Feedback',
        config: {
          prompt: 'What did you find most confusing?',
          fields: [
            { id: 'f1', type: 'text', label: 'Any questions before we wrap up?' },
          ],
        },
      },
    ],
  },
  {
    id: 'sprint-retro',
    name: 'Sprint Retrospective',
    description: 'Reflect on the past sprint, gather team sentiment, and align on improvements.',
    icon: RefreshCw,
    estimatedDuration: '45 mins',
    recommendedAudience: '5-20 people',
    categories: ['Engineering', 'Business', 'Workshops'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'wordcloud',
        title: 'Sprint in one word',
        config: {
          prompt: 'Describe the last sprint in one word',
          maxWordsPerParticipant: 3,
        },
      },
      {
        type: 'feedback',
        title: 'What went well & what didn’t?',
        config: {
          prompt: 'Sprint Feedback',
          fields: [
            { id: 'f1', type: 'text', label: 'What went well?' },
            { id: 'f2', type: 'text', label: 'What could be improved?' },
          ],
        },
      },
    ],
  },
  {
    id: 'conference-session',
    name: 'Conference Session',
    description: 'Engage large audiences, gather opinions, and run a moderated Q&A.',
    icon: Mic,
    estimatedDuration: '60 mins',
    recommendedAudience: '100+ people',
    categories: ['Business', 'Workshops'],
    settings: {
      allowAnonymousQA: true,
      requireModeration: true,
    },
    activities: [
      {
        type: 'poll',
        title: 'Audience background',
        config: {
          pollType: 'single',
          question: 'What is your primary role?',
          options: [
            { id: '1', label: 'Engineering' },
            { id: '2', label: 'Design' },
            { id: '3', label: 'Product' },
            { id: '4', label: 'Other' },
          ],
        },
      },
      {
        type: 'feedback',
        title: 'Session Rating',
        config: {
          prompt: 'How would you rate this session?',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'Key takeaway' },
          ],
        },
      },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Build excitement, gauge reactions, and gather early feedback on new features.',
    icon: Rocket,
    estimatedDuration: '30 mins',
    recommendedAudience: 'All hands',
    categories: ['Business', 'Engineering'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'poll',
        title: 'Feature excitement',
        config: {
          pollType: 'multiple',
          question: 'Which feature are you most excited about?',
          options: [
            { id: '1', label: 'Feature A' },
            { id: '2', label: 'Feature B' },
            { id: '3', label: 'Feature C' },
          ],
        },
      },
      {
        type: 'wordcloud',
        title: 'First impressions',
        config: {
          prompt: 'What comes to mind when you see the new design?',
          maxWordsPerParticipant: 3,
        },
      },
      {
        type: 'feedback',
        title: 'Launch Feedback',
        config: {
          prompt: 'Share your thoughts',
          fields: [
            { id: 'f1', type: 'text', label: 'Any concerns or questions?' },
          ],
        },
      },
    ],
  },
  {
    id: 'town-hall',
    name: 'Town Hall',
    description: 'Align the company, gather sentiment, and host a transparent Q&A.',
    icon: Users,
    estimatedDuration: '60 mins',
    recommendedAudience: 'Company-wide',
    categories: ['Business'],
    settings: {
      allowAnonymousQA: true,
      requireModeration: true,
    },
    activities: [
      {
        type: 'poll',
        title: 'Company Sentiment',
        config: {
          pollType: 'single',
          question: 'How confident do you feel about our current goals?',
          options: [
            { id: '1', label: 'Very confident' },
            { id: '2', label: 'Somewhat confident' },
            { id: '3', label: 'Not confident' },
          ],
        },
      },
      {
        type: 'feedback',
        title: 'Town Hall Feedback',
        config: {
          prompt: 'Was this Town Hall helpful?',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'What should we cover next time?' },
          ],
        },
      },
    ],
  },
  {
    id: 'training-session',
    name: 'Training Session',
    description: 'Check understanding during training and gather feedback at the end.',
    icon: Presentation,
    estimatedDuration: '90 mins',
    recommendedAudience: '10-30 people',
    categories: ['Education', 'Workshops', 'Business'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'poll',
        title: 'Prior Knowledge Check',
        config: {
          pollType: 'single',
          question: 'How much experience do you have with this topic?',
          options: [
            { id: '1', label: 'None' },
            { id: '2', label: 'Some' },
            { id: '3', label: 'Expert' },
          ],
        },
      },
      {
        type: 'quiz',
        title: 'Knowledge Check Quiz',
        config: {
          speedBonusEnabled: false,
          questions: [
            {
              id: 'q1',
              text: 'Which of the following is a key principle we discussed?',
              options: [
                { id: 'o1', label: 'Principle 1' },
                { id: 'o2', label: 'Principle 2' },
              ],
              correctOptionId: 'o1',
              points: 1000,
              timeLimitSec: 30,
            },
          ],
        },
      },
      {
        type: 'feedback',
        title: 'Training Evaluation',
        config: {
          prompt: 'Help us improve future sessions',
          fields: [
            { id: 'f1', type: 'rating', label: 'Trainer effectiveness' },
            { id: 'f2', type: 'text', label: 'What was the most valuable part?' },
          ],
        },
      },
    ],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Generate ideas quickly, vote on favorites, and discuss openly.',
    icon: Lightbulb,
    estimatedDuration: '30 mins',
    recommendedAudience: '2-15 people',
    categories: ['Workshops', 'Engineering'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'wordcloud',
        title: 'Idea Generation',
        config: {
          prompt: 'Submit your top ideas for the new project',
          maxWordsPerParticipant: 5,
        },
      },
      {
        type: 'poll',
        title: 'Vote on Ideas',
        config: {
          pollType: 'multiple',
          question: 'Which idea should we prioritize?',
          options: [
            { id: '1', label: 'Idea 1' },
            { id: '2', label: 'Idea 2' },
            { id: '3', label: 'Idea 3' },
          ],
        },
      },
    ],
  },
  {
    id: 'ama',
    name: 'AMA',
    description: 'A pure Q&A session where the audience drives the conversation.',
    icon: MessageCircleQuestion,
    estimatedDuration: '45 mins',
    recommendedAudience: 'Any size',
    categories: ['Business', 'Education', 'Engineering'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [],
  },
];
