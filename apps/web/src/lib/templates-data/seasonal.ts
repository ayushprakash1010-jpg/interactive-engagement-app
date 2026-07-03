import type { EventTemplate } from '../templates';
import { Rocket, Lightbulb, Check, Smile } from 'lucide-react';

export const SEASONAL_TEMPLATES: EventTemplate[] = [
  {
    id: 'seasonal-1',
    name: 'Seasonal Template 1',
    description: 'A ready-to-use template for Seasonal activities.',
    icon: Lightbulb,
    estimatedDuration: '15 mins',
    recommendedAudience: '5-20 people',
    difficulty: 'Workshop',
    tags: ['seasonal', 'interactive', 'engagement'],
    categories: ['Seasonal'],
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
    id: 'seasonal-2',
    name: 'Seasonal Template 2',
    description: 'A ready-to-use template for Seasonal activities.',
    icon: Check,
    estimatedDuration: '60 mins',
    recommendedAudience: '10-50 people',
    difficulty: 'Standard',
    tags: ['seasonal', 'interactive', 'engagement'],
    categories: ['Seasonal'],
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
    id: 'seasonal-3',
    name: 'Seasonal Template 3',
    description: 'A ready-to-use template for Seasonal activities.',
    icon: Rocket,
    estimatedDuration: '60 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Standard',
    tags: ['seasonal', 'interactive', 'engagement'],
    categories: ['Seasonal'],
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
      }
    ],
  },
  {
    id: 'seasonal-4',
    name: 'Seasonal Template 4',
    description: 'A ready-to-use template for Seasonal activities.',
    icon: Smile,
    estimatedDuration: '60 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Workshop',
    tags: ['seasonal', 'interactive', 'engagement'],
    categories: ['Seasonal'],
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
        type: 'quiz',
        title: 'Quiz 1',
        config: {
          speedBonusEnabled: true,
          questions: [
            {
              id: 'q1',
              text: 'Question 1?',
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
  }
];
