import type { EventTemplate } from '../templates';
import { Rocket, RefreshCw, Zap, ClipboardList } from 'lucide-react';

export const FUN_TEMPLATES: EventTemplate[] = [
  {
    id: 'fun-1',
    name: 'Fun Template 1',
    description: 'A ready-to-use template for Fun activities.',
    icon: RefreshCw,
    estimatedDuration: '15 mins',
    recommendedAudience: '100+ people',
    difficulty: 'Standard',
    tags: ['fun', 'interactive', 'engagement'],
    categories: ['Fun'],
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
    id: 'fun-2',
    name: 'Fun Template 2',
    description: 'A ready-to-use template for Fun activities.',
    icon: Rocket,
    estimatedDuration: '30 mins',
    recommendedAudience: '5-20 people',
    difficulty: 'Quick',
    tags: ['fun', 'interactive', 'engagement'],
    categories: ['Fun'],
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
        type: 'poll',
        title: 'Poll 2',
        config: {
          pollType: 'single',
          question: 'What do you think about topic 2?',
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
    id: 'fun-3',
    name: 'Fun Template 3',
    description: 'A ready-to-use template for Fun activities.',
    icon: ClipboardList,
    estimatedDuration: '60 mins',
    recommendedAudience: 'Any size',
    difficulty: 'Standard',
    tags: ['fun', 'interactive', 'engagement'],
    categories: ['Fun'],
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
    id: 'fun-4',
    name: 'Fun Template 4',
    description: 'A ready-to-use template for Fun activities.',
    icon: Zap,
    estimatedDuration: '30 mins',
    recommendedAudience: 'Any size',
    difficulty: 'Workshop',
    tags: ['fun', 'interactive', 'engagement'],
    categories: ['Fun'],
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
    id: 'fun-5',
    name: 'Fun Template 5',
    description: 'A ready-to-use template for Fun activities.',
    icon: Zap,
    estimatedDuration: '15 mins',
    recommendedAudience: '100+ people',
    difficulty: 'Quick',
    tags: ['fun', 'interactive', 'engagement'],
    categories: ['Fun'],
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
