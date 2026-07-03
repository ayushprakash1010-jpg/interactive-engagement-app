import type { EventTemplate } from '../templates';
import { Users, Presentation, Mic, Activity, Heart } from 'lucide-react';

export const ENGINEERING_TEMPLATES: EventTemplate[] = [
  {
    id: 'engineering-1',
    name: 'Engineering Template 1',
    description: 'A ready-to-use template for Engineering activities.',
    icon: Presentation,
    estimatedDuration: '60 mins',
    recommendedAudience: '100+ people',
    difficulty: 'Quick',
    tags: ['engineering', 'interactive', 'engagement'],
    categories: ['Engineering'],
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
        type: 'wordcloud',
        title: 'Word Cloud 1',
        config: {
          prompt: 'Describe 1 in one word',
          maxWordsPerParticipant: 3,
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
      },
{
        type: 'quiz',
        title: 'Quiz 3',
        config: {
          speedBonusEnabled: true,
          questions: [
            {
              id: 'q1',
              text: 'Question 3?',
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
    id: 'engineering-2',
    name: 'Engineering Template 2',
    description: 'A ready-to-use template for Engineering activities.',
    icon: Mic,
    estimatedDuration: '5 mins',
    recommendedAudience: '10-50 people',
    difficulty: 'Workshop',
    tags: ['engineering', 'interactive', 'engagement'],
    categories: ['Engineering'],
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
    id: 'engineering-3',
    name: 'Engineering Template 3',
    description: 'A ready-to-use template for Engineering activities.',
    icon: Activity,
    estimatedDuration: '10 mins',
    recommendedAudience: 'Any size',
    difficulty: 'Quick',
    tags: ['engineering', 'interactive', 'engagement'],
    categories: ['Engineering'],
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
        type: 'feedback',
        title: 'Feedback 2',
        config: {
          prompt: 'Share your thoughts on 2',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'Any other comments?' },
          ],
        },
      }
    ],
  },
  {
    id: 'engineering-4',
    name: 'Engineering Template 4',
    description: 'A ready-to-use template for Engineering activities.',
    icon: Heart,
    estimatedDuration: '10 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Workshop',
    tags: ['engineering', 'interactive', 'engagement'],
    categories: ['Engineering'],
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
      },
{
        type: 'wordcloud',
        title: 'Word Cloud 3',
        config: {
          prompt: 'Describe 3 in one word',
          maxWordsPerParticipant: 3,
        },
      }
    ],
  },
  {
    id: 'engineering-5',
    name: 'Engineering Template 5',
    description: 'A ready-to-use template for Engineering activities.',
    icon: Users,
    estimatedDuration: '60 mins',
    recommendedAudience: '100+ people',
    difficulty: 'Workshop',
    tags: ['engineering', 'interactive', 'engagement'],
    categories: ['Engineering'],
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
        type: 'wordcloud',
        title: 'Word Cloud 2',
        config: {
          prompt: 'Describe 2 in one word',
          maxWordsPerParticipant: 3,
        },
      },
{
        type: 'feedback',
        title: 'Feedback 3',
        config: {
          prompt: 'Share your thoughts on 3',
          fields: [
            { id: 'f1', type: 'rating', label: 'Overall Rating' },
            { id: 'f2', type: 'text', label: 'Any other comments?' },
          ],
        },
      }
    ],
  }
];
