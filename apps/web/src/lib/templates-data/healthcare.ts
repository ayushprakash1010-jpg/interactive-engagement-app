import type { EventTemplate } from '../templates';
import { Lightbulb, Coffee, Star, Cloud } from 'lucide-react';

export const HEALTHCARE_TEMPLATES: EventTemplate[] = [
  {
    id: 'healthcare-1',
    name: 'Healthcare Template 1',
    description: 'A ready-to-use template for Healthcare activities.',
    icon: Cloud,
    estimatedDuration: '30 mins',
    recommendedAudience: '5-20 people',
    difficulty: 'Quick',
    tags: ['healthcare', 'interactive', 'engagement'],
    categories: ['Healthcare'],
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
        type: 'poll',
        title: 'Poll 3',
        config: {
          pollType: 'single',
          question: 'What do you think about topic 3?',
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
    id: 'healthcare-2',
    name: 'Healthcare Template 2',
    description: 'A ready-to-use template for Healthcare activities.',
    icon: Lightbulb,
    estimatedDuration: '30 mins',
    recommendedAudience: '10-50 people',
    difficulty: 'Quick',
    tags: ['healthcare', 'interactive', 'engagement'],
    categories: ['Healthcare'],
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
    id: 'healthcare-3',
    name: 'Healthcare Template 3',
    description: 'A ready-to-use template for Healthcare activities.',
    icon: Star,
    estimatedDuration: '10 mins',
    recommendedAudience: 'All hands',
    difficulty: 'Standard',
    tags: ['healthcare', 'interactive', 'engagement'],
    categories: ['Healthcare'],
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
    id: 'healthcare-4',
    name: 'Healthcare Template 4',
    description: 'A ready-to-use template for Healthcare activities.',
    icon: Coffee,
    estimatedDuration: '60 mins',
    recommendedAudience: 'Any size',
    difficulty: 'Standard',
    tags: ['healthcare', 'interactive', 'engagement'],
    categories: ['Healthcare'],
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
  }
];
