import type { EventTemplate } from '../templates';
import { GraduationCap, Users, Presentation, MessageCircleQuestion } from 'lucide-react';

export const CONFERENCES_TEMPLATES: EventTemplate[] = [
  {
    id: 'conferences-1',
    name: 'Conferences Template 1',
    description: 'A ready-to-use template for Conferences activities.',
    icon: Presentation,
    estimatedDuration: '30 mins',
    recommendedAudience: '5-20 people',
    difficulty: 'Workshop',
    tags: ['conferences', 'interactive', 'engagement'],
    categories: ['Conferences'],
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
    id: 'conferences-2',
    name: 'Conferences Template 2',
    description: 'A ready-to-use template for Conferences activities.',
    icon: Users,
    estimatedDuration: '5 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Workshop',
    tags: ['conferences', 'interactive', 'engagement'],
    categories: ['Conferences'],
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
      }
    ],
  },
  {
    id: 'conferences-3',
    name: 'Conferences Template 3',
    description: 'A ready-to-use template for Conferences activities.',
    icon: MessageCircleQuestion,
    estimatedDuration: '15 mins',
    recommendedAudience: '5-20 people',
    difficulty: 'Workshop',
    tags: ['conferences', 'interactive', 'engagement'],
    categories: ['Conferences'],
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
    id: 'conferences-4',
    name: 'Conferences Template 4',
    description: 'A ready-to-use template for Conferences activities.',
    icon: GraduationCap,
    estimatedDuration: '30 mins',
    recommendedAudience: '100+ people',
    difficulty: 'Workshop',
    tags: ['conferences', 'interactive', 'engagement'],
    categories: ['Conferences'],
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
  }
];
