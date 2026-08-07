import type { EventTemplate } from '../templates';
import { Lightbulb, RefreshCw, Star, BarChart3, PenTool } from 'lucide-react';

export const WORKSHOPS_TEMPLATES: EventTemplate[] = [
  {
    id: 'workshop-design-thinking',
    name: 'Design Thinking Sprint',
    description:
      'A facilitated design thinking workshop template — from empathy mapping through ideation to concept prioritisation, all with live audience participation.',
    icon: Lightbulb,
    estimatedDuration: '90 mins',
    recommendedAudience: 'Cross-functional team (10\u201340)',
    difficulty: 'Workshop',
    featured: true,
    tags: ['design-thinking', 'ideation', 'product', 'UX', 'innovation'],
    categories: ['Workshops'],
    settings: { allowAnonymousQA: true },
    objectives: [
      'Build shared empathy for the problem space',
      'Generate a wide range of ideas collectively',
      'Prioritise the most promising concepts as a team',
    ],
    expectedOutcomes: [
      'A shortlist of ideas with group consensus score',
      'Empathy map from real participant input',
      'Documented blockers and open questions for the next sprint',
    ],
    suggestedFlow: [
      { time: '0-10 mins', description: 'Intro \u2014 what is design thinking and why are we here?' },
      { time: '10-20 mins', description: 'Empathy phase \u2014 who is our user? Wordcloud exercise' },
      { time: '20-40 mins', description: 'Ideation phase \u2014 divergent idea generation (open submissions)' },
      { time: '40-55 mins', description: 'Concept voting \u2014 which ideas have the most energy?' },
      { time: '55-70 mins', description: 'Refinement \u2014 quiz on design principles to calibrate thinking' },
      { time: '70-90 mins', description: 'Debrief survey and next steps' },
    ],
    activities: [
      {
        type: 'poll',
        title: 'Where are we starting from?',
        config: {
          pollType: 'single',
          question: 'How familiar are you with the problem we are solving today?',
          options: [
            { id: 'dt-o1', label: 'Very familiar \u2014 I work on this daily' },
            { id: 'dt-o2', label: 'Somewhat familiar \u2014 I\u2019ve heard of it' },
            { id: 'dt-o3', label: 'A little \u2014 first time hearing the details' },
            { id: 'dt-o4', label: 'Not at all \u2014 completely new to me' },
          ],
          timeLimitSec: 45,
        },
      },
      {
        type: 'wordcloud',
        title: 'Empathy Mapping \u2014 User Pain Points',
        config: {
          prompt: 'What words come to mind when you think about the frustrations our user faces?',
          maxWordsPerParticipant: 3,
          timeLimitSec: 90,
        },
      },
      {
        type: 'poll',
        title: 'Open Text \u2014 Your Best Idea',
        config: {
          pollType: 'open',
          question: 'In one sentence \u2014 what is your single best idea for solving this problem?',
          options: [],
          timeLimitSec: 120,
        },
      },
      {
        type: 'poll',
        title: 'Concept Vote \u2014 Which Direction Should We Pursue?',
        config: {
          pollType: 'multiple',
          question: 'Which of these concept directions excites you most? (Choose up to 2)',
          options: [
            { id: 'dt-cv1', label: 'Self-service digital solution' },
            { id: 'dt-cv2', label: 'AI-powered automation' },
            { id: 'dt-cv3', label: 'Human-centred service design' },
            { id: 'dt-cv4', label: 'Data-driven personalisation' },
          ],
          timeLimitSec: 60,
        },
      },
      {
        type: 'quiz',
        title: 'Design Thinking Principles Check',
        config: {
          speedBonusEnabled: false,
          questions: [
            {
              id: 'dt-q1',
              text: 'What is the primary goal of the Empathy phase in design thinking?',
              options: [
                { id: 'dt-q1-o1', label: 'Define the solution quickly' },
                { id: 'dt-q1-o2', label: 'Understand the user\u2019s needs and feelings deeply' },
                { id: 'dt-q1-o3', label: 'Prototype the product' },
                { id: 'dt-q1-o4', label: 'Run a competitive analysis' },
              ],
              correctOptionId: 'dt-q1-o2',
              points: 500,
              timeLimitSec: 20,
            },
            {
              id: 'dt-q2',
              text: 'In ideation, why is quantity of ideas valued over quality initially?',
              options: [
                { id: 'dt-q2-o1', label: 'It is faster to write many ideas' },
                { id: 'dt-q2-o2', label: 'More ideas means more billable hours' },
                { id: 'dt-q2-o3', label: 'Divergent thinking opens up unexpected solutions' },
                { id: 'dt-q2-o4', label: 'It is easier to present to stakeholders' },
              ],
              correctOptionId: 'dt-q2-o3',
              points: 500,
              timeLimitSec: 20,
            },
          ],
        },
      },
      {
        type: 'survey',
        title: 'Workshop Debrief',
        config: {
          welcomeMessage: 'Quick debrief \u2014 2 minutes to help us improve',
          thankYouMessage: 'Thank you! The facilitator will use this to plan the next sprint.',
          displayMode: 'stepper',
          questions: [
            {
              id: 'dt-sq1',
              type: 'rating',
              text: 'How would you rate the quality of ideas generated today?',
              ratingScale: 5,
              required: true,
            },
            {
              id: 'dt-sq2',
              type: 'single',
              text: 'Do you feel the group reached a meaningful direction today?',
              options: [
                { id: 'dt-sq2-o1', label: 'Yes, clearly' },
                { id: 'dt-sq2-o2', label: 'Somewhat' },
                { id: 'dt-sq2-o3', label: 'Not yet' },
              ],
              required: true,
            },
            {
              id: 'dt-sq3',
              type: 'open',
              text: 'What is the most important thing the team should do before the next sprint?',
              required: false,
            },
          ],
        },
      },
    ],
  },
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
