import type { EventTemplate } from '../templates';
import { Target, Users, TrendingUp } from 'lucide-react';

export const LEADERSHIP_TEMPLATES: EventTemplate[] = [
  {
    id: 'leadership-strategic-priority',
    name: 'Strategic Priority Ranking',
    description:
      'Help your leadership team reach consensus on strategic priorities using structured polls, a knowledge quiz, and open feedback collection.',
    icon: Target,
    estimatedDuration: '45 mins',
    recommendedAudience: 'Leadership team (10\u201350)',
    difficulty: 'Workshop',
    featured: true,
    tags: ['strategy', 'prioritization', 'decision-making', 'leadership'],
    categories: ['Leadership'],
    settings: { allowAnonymousQA: true },
    objectives: [
      'Align the team on top strategic priorities',
      'Surface disagreements before they become blockers',
      'Create a shared, documented priority decision',
    ],
    expectedOutcomes: [
      'Ranked list of strategic initiatives with team buy-in',
      'Clear visibility into areas of disagreement',
      'Documented rationale for priority decisions',
    ],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Context setting \u2014 why we are ranking these priorities today' },
      { time: '5-15 mins', description: 'Individual priority voting \u2014 polls on each initiative' },
      { time: '15-25 mins', description: 'Discussion round \u2014 word cloud on top concerns' },
      { time: '25-35 mins', description: 'Confidence check \u2014 rating poll per initiative' },
      { time: '35-45 mins', description: 'Open Q&A and next steps survey' },
    ],
    activities: [
      {
        type: 'poll',
        title: 'Which initiative should be our #1 priority this quarter?',
        config: {
          pollType: 'single',
          question: 'Which initiative should be our #1 priority this quarter?',
          options: [
            { id: 'p1-o1', label: 'Market Expansion' },
            { id: 'p1-o2', label: 'Product Innovation' },
            { id: 'p1-o3', label: 'Operational Efficiency' },
            { id: 'p1-o4', label: 'Customer Retention' },
          ],
          timeLimitSec: 60,
        },
      },
      {
        type: 'poll',
        title: 'How confident are you in our current strategy?',
        config: {
          pollType: 'rating',
          question: 'How confident are you in our current strategy?',
          options: [],
          ratingScale: 5,
          timeLimitSec: 30,
        },
      },
      {
        type: 'wordcloud',
        title: 'Top risks to our strategic priorities',
        config: {
          prompt: 'What is the biggest risk to achieving our top strategic priorities?',
          maxWordsPerParticipant: 3,
          timeLimitSec: 60,
        },
      },
      {
        type: 'survey',
        title: 'Post-Priority Session Debrief',
        config: {
          welcomeMessage: 'Quick debrief \u2014 takes under 2 minutes',
          thankYouMessage: 'Thank you! Results will be shared with the full leadership team.',
          displayMode: 'stepper',
          questions: [
            {
              id: 'sq1',
              type: 'single',
              text: "Did today's session help clarify our strategic direction?",
              options: [
                { id: 'sq1-o1', label: 'Yes, very much' },
                { id: 'sq1-o2', label: 'Somewhat' },
                { id: 'sq1-o3', label: 'Not really' },
              ],
              required: true,
            },
            {
              id: 'sq2',
              type: 'open',
              text: 'What one decision should we make immediately based on today?',
              required: false,
            },
          ],
        },
      },
      {
        type: 'feedback',
        title: 'Session Effectiveness Rating',
        config: {
          prompt: 'How effective was this priority-setting session?',
          fields: [
            { id: 'fb1', type: 'rating', label: 'Overall session effectiveness' },
            { id: 'fb2', type: 'text', label: 'What could we do differently next time?' },
          ],
        },
      },
    ],
  },

  {
    id: 'leadership-town-hall',
    name: 'Executive Town Hall',
    description:
      'A structured town hall template that drives real two-way engagement between leadership and the broader organisation \u2014 with live polls, Q&A, and sentiment tracking.',
    icon: Users,
    estimatedDuration: '60 mins',
    recommendedAudience: 'All-hands (50\u2013500+)',
    difficulty: 'Standard',
    featured: true,
    tags: ['town-hall', 'all-hands', 'leadership', 'company-update'],
    categories: ['Leadership'],
    settings: { allowAnonymousQA: true },
    objectives: [
      'Share company progress and key metrics',
      'Gauge employee morale and alignment',
      'Collect candid questions and concerns at scale',
    ],
    expectedOutcomes: [
      'Real-time pulse on employee sentiment',
      'Crowdsourced top questions for leadership',
      'Documented post-session feedback for follow-up',
    ],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Welcome and agenda overview' },
      { time: '5-10 mins', description: 'Pulse check \u2014 how is everyone feeling?' },
      { time: '10-30 mins', description: 'Leadership updates and announcements' },
      { time: '30-45 mins', description: 'Open Q&A \u2014 upvote the questions you care about most' },
      { time: '45-60 mins', description: 'Closing poll and post-session survey' },
    ],
    activities: [
      {
        type: 'poll',
        title: 'Team Sentiment Check',
        config: {
          pollType: 'single',
          question: 'How are you feeling heading into this quarter?',
          options: [
            { id: 'th-o1', label: '\ud83d\ude80 Energised and optimistic' },
            { id: 'th-o2', label: '\ud83d\ude0a Positive but cautious' },
            { id: 'th-o3', label: "\ud83d\ude10 Neutral \u2014 let's see what happens" },
            { id: 'th-o4', label: '\ud83d\ude1f Concerned about some things' },
          ],
          timeLimitSec: 45,
        },
      },
      {
        type: 'wordcloud',
        title: 'What matters most to you right now?',
        config: {
          prompt: 'In one or two words \u2014 what matters most to you at work right now?',
          maxWordsPerParticipant: 2,
          timeLimitSec: 60,
        },
      },
      {
        type: 'poll',
        title: 'Company Direction Confidence',
        config: {
          pollType: 'rating',
          question: "How confident are you in the company's direction over the next 12 months?",
          options: [],
          ratingScale: 5,
          timeLimitSec: 30,
        },
      },
      {
        type: 'survey',
        title: 'Town Hall Post-Session Feedback',
        config: {
          welcomeMessage: 'Your honest feedback helps us run better town halls',
          thankYouMessage:
            'Thank you \u2014 all responses are anonymous and will be reviewed by HR and leadership.',
          displayMode: 'stepper',
          questions: [
            {
              id: 'th-sq1',
              type: 'rating',
              text: 'How satisfied were you with the information shared today?',
              ratingScale: 5,
              required: true,
            },
            {
              id: 'th-sq2',
              type: 'single',
              text: 'Did leadership address the issues most important to you?',
              options: [
                { id: 'th-sq2-o1', label: 'Yes, fully' },
                { id: 'th-sq2-o2', label: 'Partially' },
                { id: 'th-sq2-o3', label: 'Not really' },
              ],
              required: true,
            },
            {
              id: 'th-sq3',
              type: 'open',
              text: 'What topic would you most like addressed at the next town hall?',
              required: false,
            },
          ],
        },
      },
    ],
  },

  {
    id: 'leadership-okr-review',
    name: 'Quarterly OKR Review',
    description:
      'A focused quarterly OKR review session with live scoring, achievement celebration, and structured planning for the next quarter.',
    icon: TrendingUp,
    estimatedDuration: '50 mins',
    recommendedAudience: 'Department teams (10\u201330)',
    difficulty: 'Standard',
    tags: ['okr', 'quarterly-review', 'goal-setting', 'performance'],
    categories: ['Leadership'],
    settings: { allowAnonymousQA: false },
    objectives: [
      "Honestly assess last quarter's OKR achievement",
      'Identify blockers and lessons learned',
      "Build alignment on next quarter's priorities",
    ],
    expectedOutcomes: [
      'Team-averaged OKR confidence scores',
      'Documented blockers from open submissions',
      'Agreed focus areas for next quarter',
    ],
    suggestedFlow: [
      { time: '0-5 mins', description: 'Quick warm-up and agenda overview' },
      { time: '5-20 mins', description: 'OKR scoring round \u2014 rate achievement per key result' },
      { time: '20-30 mins', description: 'Blockers and lessons wordcloud' },
      { time: '30-40 mins', description: 'Next quarter priorities poll' },
      { time: '40-50 mins', description: 'Commitment quiz and closing feedback' },
    ],
    activities: [
      {
        type: 'poll',
        title: 'Q Last Quarter: Overall OKR Achievement',
        config: {
          pollType: 'rating',
          question: "How would you rate the team's overall OKR achievement last quarter?",
          options: [],
          ratingScale: 10,
          timeLimitSec: 30,
        },
      },
      {
        type: 'wordcloud',
        title: 'What blocked us last quarter?',
        config: {
          prompt: 'What was the biggest blocker to achieving our OKRs last quarter?',
          maxWordsPerParticipant: 3,
          timeLimitSec: 60,
        },
      },
      {
        type: 'poll',
        title: 'Next Quarter: Top Focus Area',
        config: {
          pollType: 'multiple',
          question: 'Which areas should we focus on most this coming quarter? (Select up to 2)',
          options: [
            { id: 'okr-o1', label: 'Shipping faster' },
            { id: 'okr-o2', label: 'Improving quality' },
            { id: 'okr-o3', label: 'Reducing technical debt' },
            { id: 'okr-o4', label: 'Growing the team' },
          ],
          timeLimitSec: 60,
        },
      },
      {
        type: 'quiz',
        title: 'OKR Best Practices Quick Check',
        config: {
          speedBonusEnabled: false,
          questions: [
            {
              id: 'okr-q1',
              text: 'What does a good Key Result look like?',
              options: [
                { id: 'okr-q1-o1', label: 'Vague and aspirational' },
                { id: 'okr-q1-o2', label: 'Specific, measurable, and time-bound' },
                { id: 'okr-q1-o3', label: 'Always 100% achievable' },
                { id: 'okr-q1-o4', label: 'Set by managers only' },
              ],
              correctOptionId: 'okr-q1-o2',
              points: 500,
              timeLimitSec: 20,
            },
            {
              id: 'okr-q2',
              text: 'What is a healthy OKR achievement rate?',
              options: [
                { id: 'okr-q2-o1', label: '100% every quarter' },
                { id: 'okr-q2-o2', label: '30\u201350%' },
                { id: 'okr-q2-o3', label: '60\u201370%' },
                { id: 'okr-q2-o4', label: "It doesn't matter" },
              ],
              correctOptionId: 'okr-q2-o3',
              points: 500,
              timeLimitSec: 20,
            },
          ],
        },
      },
      {
        type: 'feedback',
        title: 'OKR Review Session Feedback',
        config: {
          prompt: "How useful was today's OKR review session?",
          fields: [
            { id: 'okr-fb1', type: 'rating', label: 'Session usefulness' },
            { id: 'okr-fb2', type: 'text', label: 'One thing we should do differently next review?' },
          ],
        },
      },
    ],
  },
];
