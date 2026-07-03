import type { EventTemplate } from '../templates';
import { RefreshCw, Star, BarChart3 } from 'lucide-react';

export const WORKSHOPS_TEMPLATES: EventTemplate[] = [
  {
    id: 'workshops-1',
    name: 'Workshops Template 1',
    description: 'A ready-to-use template for Workshops activities.',
    icon: BarChart3,
    estimatedDuration: '60 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Standard',
    tags: ['workshops', 'interactive', 'engagement'],
    categories: ['Workshops'],
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
      }
    ],
  },
  {
    id: 'workshops-2',
    name: 'Workshops Template 2',
    description: 'A ready-to-use template for Workshops activities.',
    icon: RefreshCw,
    estimatedDuration: '30 mins',
    recommendedAudience: 'Any size',
    difficulty: 'Standard',
    tags: ['workshops', 'interactive', 'engagement'],
    categories: ['Workshops'],
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
        type: 'quiz',
        title: 'Quiz 0',
        config: {
          speedBonusEnabled: true,
          questions: [
            {
              id: 'q1',
              text: 'Question 0?',
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
      },
{
        type: 'wordcloud',
        title: 'Word Cloud 1',
        config: {
          prompt: 'Describe 1 in one word',
          maxWordsPerParticipant: 3,
        },
      }
    ],
  },
  {
    id: 'workshops-3',
    name: 'Workshops Template 3',
    description: 'A ready-to-use template for Workshops activities.',
    icon: Star,
    estimatedDuration: '60 mins',
    recommendedAudience: '10-50 people',
    difficulty: 'Standard',
    tags: ['workshops', 'interactive', 'engagement'],
    categories: ['Workshops'],
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
    id: 'workshops-4',
    name: 'Workshops Template 4',
    description: 'A ready-to-use template for Workshops activities.',
    icon: Star,
    estimatedDuration: '5 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Workshop',
    tags: ['workshops', 'interactive', 'engagement'],
    categories: ['Workshops'],
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
  }
];
