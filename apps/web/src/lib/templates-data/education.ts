import type { EventTemplate } from '../templates';
import { GraduationCap, Users, Star, BarChart3 } from 'lucide-react';

export const EDUCATION_TEMPLATES: EventTemplate[] = [
  {
    id: 'education-1',
    name: 'Education Template 1',
    description: 'A ready-to-use template for Education activities.',
    icon: BarChart3,
    estimatedDuration: '60 mins',
    recommendedAudience: '10-50 people',
    difficulty: 'Quick',
    tags: ['education', 'interactive', 'engagement'],
    categories: ['Education'],
    settings: {
      allowAnonymousQA: true,
    },
    objectives: ['Engage audience', 'Gather feedback', 'Improve collaboration'],
    expectedOutcomes: ['Actionable insights', 'Increased participation'],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Introduction and warmup' },
      { time: '5-15 mins', description: 'Main activity' },
      { time: '15-20 mins', description: 'Wrap up and Q&A' }
    ],
    activities: [
      {
        type: 'feedback',
        title: 'Feedback 0',
        config: {
          prompt: 'Share your thoughts on 0',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'Any other comments?' },
          ],
        },
      }
    ],
  },
  {
    id: 'education-2',
    name: 'Education Template 2',
    description: 'A ready-to-use template for Education activities.',
    icon: Users,
    estimatedDuration: '30 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Standard',
    tags: ['education', 'interactive', 'engagement'],
    categories: ['Education'],
    settings: {
      allowAnonymousQA: false,
    },
    objectives: ['Engage audience', 'Gather feedback', 'Improve collaboration'],
    expectedOutcomes: ['Actionable insights', 'Increased participation'],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Introduction and warmup' },
      { time: '5-15 mins', description: 'Main activity' },
      { time: '15-20 mins', description: 'Wrap up and Q&A' }
    ],
    activities: [
      {
        type: 'wordcloud',
        title: 'Word Cloud 0',
        config: {
          prompt: 'Describe 0 in one word',
          maxWordsPerParticipant: 3,
        },
      }
    ],
  },
  {
    id: 'education-3',
    name: 'Education Template 3',
    description: 'A ready-to-use template for Education activities.',
    icon: Star,
    estimatedDuration: '5 mins',
    recommendedAudience: 'Any size',
    difficulty: 'Workshop',
    tags: ['education', 'interactive', 'engagement'],
    categories: ['Education'],
    settings: {
      allowAnonymousQA: true,
    },
    objectives: ['Engage audience', 'Gather feedback', 'Improve collaboration'],
    expectedOutcomes: ['Actionable insights', 'Increased participation'],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Introduction and warmup' },
      { time: '5-15 mins', description: 'Main activity' },
      { time: '15-20 mins', description: 'Wrap up and Q&A' }
    ],
    activities: [
      {
        type: 'wordcloud',
        title: 'Word Cloud 0',
        config: {
          prompt: 'Describe 0 in one word',
          maxWordsPerParticipant: 3,
        },
      },
{
        type: 'feedback',
        title: 'Feedback 1',
        config: {
          prompt: 'Share your thoughts on 1',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'Any other comments?' },
          ],
        },
      },
{
        type: 'quiz',
        title: 'Quiz 2',
        config: {
          speedBonusEnabled: true,
          questions: [
            {
              id: 'q1',
              text: 'Question 2?',
              options: [
                { id: 'o1', label: 'Option A' },
                { id: 'o2', label: 'Option B' },
                { id: 'o3', label: 'Option C' },
              ],
              correctOptionId: 'o1',
              points: 1000,
              timeLimitSec: 20,
            },
          ],
        },
      }
    ],
  },
  {
    id: 'education-4',
    name: 'Education Template 4',
    description: 'A ready-to-use template for Education activities.',
    icon: Users,
    estimatedDuration: '5 mins',
    recommendedAudience: '5-20 people',
    difficulty: 'Standard',
    tags: ['education', 'interactive', 'engagement'],
    categories: ['Education'],
    settings: {
      allowAnonymousQA: false,
    },
    objectives: ['Engage audience', 'Gather feedback', 'Improve collaboration'],
    expectedOutcomes: ['Actionable insights', 'Increased participation'],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Introduction and warmup' },
      { time: '5-15 mins', description: 'Main activity' },
      { time: '15-20 mins', description: 'Wrap up and Q&A' }
    ],
    activities: [
      {
        type: 'poll',
        title: 'Poll 0',
        config: {
          pollType: 'single',
          question: 'What do you think about topic 0?',
          options: [
            { id: '1', label: 'Great' },
            { id: '2', label: 'Good' },
            { id: '3', label: 'Okay' },
            { id: '4', label: 'Poor' },
          ],
        },
      }
    ],
  },
  {
    id: 'education-5',
    name: 'Education Template 5',
    description: 'A ready-to-use template for Education activities.',
    icon: GraduationCap,
    estimatedDuration: '30 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Standard',
    tags: ['education', 'interactive', 'engagement'],
    categories: ['Education'],
    settings: {
      allowAnonymousQA: true,
    },
    objectives: ['Engage audience', 'Gather feedback', 'Improve collaboration'],
    expectedOutcomes: ['Actionable insights', 'Increased participation'],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Introduction and warmup' },
      { time: '5-15 mins', description: 'Main activity' },
      { time: '15-20 mins', description: 'Wrap up and Q&A' }
    ],
    activities: [
      {
        type: 'feedback',
        title: 'Feedback 0',
        config: {
          prompt: 'Share your thoughts on 0',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'Any other comments?' },
          ],
        },
      },
{
        type: 'poll',
        title: 'Poll 1',
        config: {
          pollType: 'single',
          question: 'What do you think about topic 1?',
          options: [
            { id: '1', label: 'Great' },
            { id: '2', label: 'Good' },
            { id: '3', label: 'Okay' },
            { id: '4', label: 'Poor' },
          ],
        },
      },
{
        type: 'wordcloud',
        title: 'Word Cloud 2',
        config: {
          prompt: 'Describe 2 in one word',
          maxWordsPerParticipant: 3,
        },
      }
    ],
  }
];
