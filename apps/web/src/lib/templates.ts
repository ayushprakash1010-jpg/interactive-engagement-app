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
  ClipboardList,
  Check,
  BarChart3,
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
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Collect attendee details, dietary preferences, and expectations before the event begins.',
    icon: ClipboardList,
    estimatedDuration: 'Before Event',
    recommendedAudience: 'All attendees',
    categories: ['Business', 'Workshops', 'Education'],
    settings: {
      allowAnonymousQA: false,
    },
    activities: [
      {
        type: 'survey',
        title: 'Registration Form',
        config: {
          questions: [
            {
              id: 'q1',
              type: 'open',
              text: 'What is your full name?',
              required: true,
            },
            {
              id: 'q2',
              type: 'single',
              text: 'What is your primary role?',
              options: [
                { id: 'o1', label: 'Engineering' },
                { id: 'o2', label: 'Product' },
                { id: 'o3', label: 'Design' },
                { id: 'o4', label: 'Marketing' },
                { id: 'o5', label: 'Other' },
              ],
              required: true,
            },
            {
              id: 'q3',
              type: 'multiple',
              text: 'Do you have any dietary restrictions?',
              options: [
                { id: 'o1', label: 'Vegetarian' },
                { id: 'o2', label: 'Vegan' },
                { id: 'o3', label: 'Gluten-Free' },
                { id: 'o4', label: 'Nut Allergy' },
                { id: 'o5', label: 'None' },
              ],
              required: false,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'conference-feedback',
    name: 'Conference Feedback',
    description: 'Comprehensive post-event survey to evaluate speakers, sessions, and overall satisfaction.',
    icon: ClipboardList,
    estimatedDuration: 'After Event',
    recommendedAudience: 'All attendees',
    categories: ['Business', 'Workshops'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'survey',
        title: 'Event Satisfaction Survey',
        config: {
          questions: [
            {
              id: 'q1',
              type: 'rating',
              text: 'How would you rate the overall conference experience?',
              required: true,
            },
            {
              id: 'q2',
              type: 'single',
              text: 'Would you attend this event again next year?',
              options: [
                { id: 'o1', label: 'Definitely' },
                { id: 'o2', label: 'Probably' },
                { id: 'o3', label: 'Not sure' },
                { id: 'o4', label: 'Probably not' },
              ],
              required: true,
            },
            {
              id: 'q3',
              type: 'open',
              text: 'What was your favorite session and why?',
              required: false,
            },
            {
              id: 'q4',
              type: 'open',
              text: 'How can we improve for next time?',
              required: false,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'audience-profiling',
    name: 'Audience Profiling',
    description: 'Quick survey to understand audience demographics and experience level.',
    icon: ClipboardList,
    estimatedDuration: '5 mins',
    recommendedAudience: 'Any size',
    categories: ['Education', 'Workshops'],
    settings: {
      allowAnonymousQA: true,
    },
    activities: [
      {
        type: 'survey',
        title: 'Audience Profiling',
        config: {
          questions: [
            {
              id: 'q1',
              type: 'single',
              text: 'How many years of experience do you have in this field?',
              options: [
                { id: 'o1', label: '0-2 years' },
                { id: 'o2', label: '3-5 years' },
                { id: 'o3', label: '5-10 years' },
                { id: 'o4', label: '10+ years' },
              ],
              required: true,
            },
            {
              id: 'q2',
              type: 'single',
              text: 'What is your primary learning goal today?',
              options: [
                { id: 'o1', label: 'Learn basics' },
                { id: 'o2', label: 'Deep dive into advanced topics' },
                { id: 'o3', label: 'Networking' },
              ],
              required: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'session-selection',
    name: 'Session Selection',
    description: 'Allow participants to choose which tracks or sessions they plan to attend.',
    icon: ClipboardList,
    estimatedDuration: '2 mins',
    recommendedAudience: 'Any size',
    categories: ['Conferences', 'Workshops'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Session Selection',
        config: {
          questions: [
            { id: 'q1', type: 'single', text: 'Which track are you most interested in?', options: [{id:'o1',label:'Engineering'},{id:'o2',label:'Design'},{id:'o3',label:'Product'}], required: true },
            { id: 'q2', type: 'multiple', text: 'Select the afternoon workshops you will attend:', options: [{id:'o1',label:'Advanced React'},{id:'o2',label:'Figma Prototyping'},{id:'o3',label:'User Research Methods'}], required: true }
          ]
        }
      }
    ]
  },
  {
    id: 'dietary-preferences',
    name: 'Dietary Preferences',
    description: 'Collect dietary restrictions and preferences for catered events.',
    icon: Coffee,
    estimatedDuration: '1 min',
    recommendedAudience: 'Any size',
    categories: ['Events'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Dietary Preferences',
        config: {
          questions: [
            { id: 'q1', type: 'multiple', text: 'Do you have any dietary restrictions?', options: [{id:'o1',label:'Vegetarian'},{id:'o2',label:'Vegan'},{id:'o3',label:'Gluten-free'},{id:'o4',label:'Dairy-free'}], required: false },
            { id: 'q2', type: 'open', text: 'Please list any specific food allergies we should be aware of:', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'speaker-questions',
    name: 'Speaker Questions',
    description: 'Collect questions for the speaker before the event starts.',
    icon: MessageCircleQuestion,
    estimatedDuration: '2 mins',
    recommendedAudience: 'Any size',
    categories: ['Webinars', 'Conferences'],
    settings: { allowAnonymousQA: true },
    activities: [
      {
        type: 'survey',
        title: 'Questions for the Speaker',
        config: {
          questions: [
            { id: 'q1', type: 'open', text: 'What is your primary question for our speaker?', required: true },
            { id: 'q2', type: 'open', text: 'What specific challenge are you hoping to solve?', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'live-session-feedback',
    name: 'Live Session Feedback',
    description: 'Capture immediate feedback right after a presentation.',
    icon: Presentation,
    estimatedDuration: '3 mins',
    recommendedAudience: 'Any size',
    categories: ['Workshops', 'Conferences'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Live Session Feedback',
        config: {
          questions: [
            { id: 'q1', type: 'rating', text: 'How would you rate this session overall?', required: true },
            { id: 'q2', type: 'open', text: 'What was your biggest takeaway?', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'knowledge-check',
    name: 'Knowledge Check',
    description: 'A quick survey to assess learning comprehension during a workshop.',
    icon: Lightbulb,
    estimatedDuration: '3 mins',
    recommendedAudience: 'Classrooms, Workshops',
    categories: ['Education'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Knowledge Check',
        config: {
          questions: [
            { id: 'q1', type: 'single', text: 'Did you understand the core concept presented?', options: [{id:'o1',label:'Yes, completely'},{id:'o2',label:'Mostly'},{id:'o3',label:'Need more help'}], required: true },
            { id: 'q2', type: 'open', text: 'What topic is still unclear?', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'workshop-assessment',
    name: 'Workshop Assessment',
    description: 'Detailed survey to assess the workshop structure and material.',
    icon: GraduationCap,
    estimatedDuration: '5 mins',
    recommendedAudience: 'Workshops',
    categories: ['Education', 'Workshops'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Workshop Assessment',
        config: {
          questions: [
            { id: 'q1', type: 'rating', text: 'How useful were the hands-on exercises?', required: true },
            { id: 'q2', type: 'single', text: 'Was the pace of the workshop appropriate?', options: [{id:'o1',label:'Too fast'},{id:'o2',label:'Just right'},{id:'o3',label:'Too slow'}], required: true }
          ]
        }
      }
    ]
  },
  {
    id: 'attendance-confirmation',
    name: 'Attendance Confirmation',
    description: 'Quick check-in survey to confirm presence.',
    icon: Check,
    estimatedDuration: '1 min',
    recommendedAudience: 'Any size',
    categories: ['Events'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Attendance Check-in',
        config: {
          questions: [
            { id: 'q1', type: 'open', text: 'Please enter your Full Name', required: true },
            { id: 'q2', type: 'open', text: 'Employee/Student ID', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'speaker-evaluation',
    name: 'Speaker Evaluation',
    description: 'Evaluate speaker performance, delivery, and content quality.',
    icon: Mic,
    estimatedDuration: '4 mins',
    recommendedAudience: 'Conferences',
    categories: ['Conferences'],
    settings: { allowAnonymousQA: true },
    activities: [
      {
        type: 'survey',
        title: 'Speaker Evaluation',
        config: {
          questions: [
            { id: 'q1', type: 'rating', text: 'Rate the speaker\'s presentation skills', required: true },
            { id: 'q2', type: 'rating', text: 'Rate the quality of the content', required: true },
            { id: 'q3', type: 'open', text: 'Any additional comments for the speaker?', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'training-evaluation',
    name: 'Training Evaluation',
    description: 'Comprehensive survey for corporate training sessions.',
    icon: Rocket,
    estimatedDuration: '5 mins',
    recommendedAudience: 'Corporate Training',
    categories: ['Business'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Training Evaluation',
        config: {
          questions: [
            { id: 'q1', type: 'rating', text: 'How relevant was this training to your role?', required: true },
            { id: 'q2', type: 'single', text: 'Would you recommend this training to a colleague?', options: [{id:'o1',label:'Yes'},{id:'o2',label:'No'}], required: true }
          ]
        }
      }
    ]
  },
  {
    id: 'nps-survey',
    name: 'NPS Survey',
    description: 'Standard Net Promoter Score survey.',
    icon: BarChart3,
    estimatedDuration: '2 mins',
    recommendedAudience: 'Any size',
    categories: ['Business'],
    settings: { allowAnonymousQA: true },
    activities: [
      {
        type: 'survey',
        title: 'Net Promoter Score',
        config: {
          questions: [
            { id: 'q1', type: 'rating', text: 'How likely are you to recommend us to a friend or colleague?', required: true },
            { id: 'q2', type: 'open', text: 'What is the primary reason for your score?', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'follow-up-survey',
    name: 'Follow-up Survey',
    description: 'Send to participants a few days after the event.',
    icon: RefreshCw,
    estimatedDuration: '3 mins',
    recommendedAudience: 'Any size',
    categories: ['Events'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Event Follow-up',
        config: {
          questions: [
            { id: 'q1', type: 'single', text: 'Have you applied what you learned?', options: [{id:'o1',label:'Yes'},{id:'o2',label:'Not yet'},{id:'o3',label:'No'}], required: true },
            { id: 'q2', type: 'open', text: 'What additional resources do you need?', required: false }
          ]
        }
      }
    ]
  },
  {
    id: 'certificate-feedback',
    name: 'Certificate Feedback',
    description: 'Final feedback required before issuing completion certificates.',
    icon: GraduationCap,
    estimatedDuration: '3 mins',
    recommendedAudience: 'Training, Workshops',
    categories: ['Education'],
    settings: { allowAnonymousQA: false },
    activities: [
      {
        type: 'survey',
        title: 'Certificate Issuance Survey',
        config: {
          questions: [
            { id: 'q1', type: 'open', text: 'Name to appear on certificate:', required: true },
            { id: 'q2', type: 'open', text: 'Email to send certificate to:', required: true },
            { id: 'q3', type: 'rating', text: 'Overall rating of the program:', required: true }
          ]
        }
      }
    ]
  }
];
