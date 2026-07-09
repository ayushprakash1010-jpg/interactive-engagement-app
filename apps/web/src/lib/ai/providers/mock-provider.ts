import { type AIProvider } from './interface';
import { type SessionPlan, type DraftActivity, type SessionReview, type ReviewFinding, type PostEventIntelligence, type LiveAssistantState } from '../types';

export class MockProvider implements AIProvider {
  name = 'LegacyAPIProvider'; // Acts as the bridge to the existing Node backend for now

  private async simulateDelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateSessionPlan(config: Record<string, any>): Promise<{ plan: SessionPlan; drafts: DraftActivity[] }> {
    const cleanPrompt = config.prompt?.trim();
    if (!cleanPrompt) {
      throw new Error('Please describe the session you want to generate.');
    }

    const res = await fetch('/api/proxy/ai/generate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: cleanPrompt }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate session. Server returned ${res.status}.`);
    }

    const data = await res.json();
    const activities = Array.isArray(data.activities) ? data.activities : [];

    if (activities.length === 0) {
      throw new Error('AI did not return any activities. Please try again.');
    }

    const parsedActivities = activities.map((activity: any, index: number) => {
      // Inline normaliseActivity to avoid circular dependencies with UI
      const type = activity.type?.toLowerCase() || 'poll';
      const question = activity.question || activity.title || `Generated Activity ${index + 1}`;
      let title = activity.title;
      if (!title) {
        title = type.charAt(0).toUpperCase() + type.slice(1);
        if (question && question !== title) {
          title = `${title}: ${question.substring(0, 30)}${question.length > 30 ? '...' : ''}`;
        }
      }
      return {
        id: `activity-${Date.now()}-${index}`,
        type: type,
        title: title,
        description: question,
        config: activity,
      };
    });

    // 1. Parse configured duration (e.g., "30m" -> 30, "1h" -> 60)
    let totalMinutes = 30; // default
    if (config.duration === '15m') totalMinutes = 15;
    if (config.duration === '30m') totalMinutes = 30;
    if (config.duration === '1h') totalMinutes = 60;
    if (config.duration === '2h+') totalMinutes = 120;

    // 2. Synthesize Agenda Timeline
    const agenda: any[] = [];
    
    // Add welcome/intro
    agenda.push({
      id: 'tl-welcome',
      timeOffsetMinutes: 0,
      title: 'Welcome & Introduction',
      durationMinutes: Math.min(5, Math.max(2, Math.floor(totalMinutes * 0.1))),
      purpose: 'intro',
    });

    const introDuration = agenda[0]?.durationMinutes ?? Math.min(5, Math.max(2, Math.floor(totalMinutes * 0.1)));
    const closingDuration = Math.min(5, Math.max(2, Math.floor(totalMinutes * 0.1)));
    const contentDuration = totalMinutes - introDuration - closingDuration;
    
    const interval = parsedActivities.length > 0 ? contentDuration / (parsedActivities.length + 1) : contentDuration;
    let currentTime = introDuration;
    
    parsedActivities.forEach((act: any, index: number) => {
      if (interval > 5) {
        agenda.push({
          id: `tl-content-${index}`,
          timeOffsetMinutes: Math.round(currentTime),
          title: `Content / Discussion Block ${index + 1}`,
          durationMinutes: Math.round(interval) - 2, 
          purpose: 'content',
        });
        currentTime += Math.round(interval) - 2;
      }

      let purpose = 'engagement';
      if (act.type === 'quiz' || act.type === 'survey') purpose = 'assessment';
      if (act.type === 'feedback') purpose = 'closing';

      agenda.push({
        id: `tl-act-${act.id}`,
        timeOffsetMinutes: Math.round(currentTime),
        activityId: act.id,
        title: act.title,
        durationMinutes: 2,
        purpose,
      });
      
      currentTime += 2;
      if (interval <= 5) {
         currentTime += Math.round(interval) - 2;
      }
    });

    agenda.push({
      id: 'tl-closing',
      timeOffsetMinutes: totalMinutes - closingDuration,
      title: 'Closing Remarks & Next Steps',
      durationMinutes: closingDuration,
      purpose: 'closing',
    });

    const recommendations: any[] = [];
    const hasIcebreaker = parsedActivities.some((a: any) => a.type === 'wordcloud' || a.title.toLowerCase().includes('icebreaker'));
    const hasFeedback = parsedActivities.some((a: any) => a.type === 'feedback');
    const quizCount = parsedActivities.filter((a: any) => a.type === 'quiz').length;

    if (!hasIcebreaker && totalMinutes >= 30) {
      recommendations.push({
        id: 'rec-1',
        title: 'Consider an icebreaker',
        description: 'Start with a light word cloud to get the audience engaged.',
        action: 'Add Word Cloud',
        priority: 'medium',
      });
    }

    if (quizCount > 2) {
      recommendations.push({
        id: 'rec-2',
        title: 'Session is quiz-heavy',
        description: 'Consider breaking up quizzes with open-ended Q&A to reduce cognitive load.',
        action: 'Convert to Q&A',
        priority: 'high',
      });
    }

    if (!hasFeedback) {
      recommendations.push({
        id: 'rec-3',
        title: 'Consider ending with feedback',
        description: 'Collect NPS or feedback at the end of the session to measure success.',
        action: 'Add Feedback',
        priority: 'high',
      });
    }

    if (parsedActivities.length === 0) {
      recommendations.push({
        id: 'rec-4',
        title: 'No interactions planned',
        description: 'Generate some activities to boost engagement.',
        action: 'Generate Draft',
        priority: 'high',
      });
    }

    const uniqueTypes = new Set(parsedActivities.map((a: any) => a.type)).size;
    let variety = 'Good';
    if (uniqueTypes <= 1 && parsedActivities.length > 1) variety = 'Needs Variety';
    if (uniqueTypes > 3) variety = 'Excellent';

    const plan: SessionPlan = {
      id: `plan-${Date.now()}`,
      title: data.event?.title || config.title || 'AI Session Plan',
      objective: data.event?.description || config.description || 'Generated Session',
      audience: config.audienceType || 'Mixed',
      eventType: config.eventType || 'Meeting',
      duration: config.duration || '30m',
      tone: config.tone || 'Professional',
      estimatedEngagement: data.engagement?.score || Math.round(75 + Math.random() * 20),
      planningConfidence: parsedActivities.length > 0 ? 'High' : 'Low',
      durationFit: 92, 
      interactionVariety: variety,
      agenda,
      recommendations,
    };

    return { plan, drafts: parsedActivities };
  }

  async processMutation(intent: string, currentPlan: SessionPlan, drafts: DraftActivity[], accepted: DraftActivity[]): Promise<{ newPlan: SessionPlan; diffSummary: string[]; reasoning?: string; confidence?: number; affectedActivities?: string[]; estimatedImpact?: string; }> {
    await new Promise(r => setTimeout(r, 1200));

    const proposedPlan = JSON.parse(JSON.stringify(currentPlan)) as SessionPlan;
    const lowerIntent = intent.toLowerCase();
    const diffSummary: string[] = [];

    if (lowerIntent.includes('shorter') || lowerIntent.includes('reduce')) {
      proposedPlan.duration = '30m';
      proposedPlan.agenda = proposedPlan.agenda.filter(item => item.purpose !== 'engagement');
      proposedPlan.agenda.forEach(item => {
        if (item.purpose === 'content') item.durationMinutes = 15;
      });
      diffSummary.push('Reduced overall duration to 30 minutes.');
      diffSummary.push('Removed mid-session engagement activity.');
      diffSummary.push('Shortened core presentation to 15 minutes.');
    } else if (lowerIntent.includes('fun') || lowerIntent.includes('interactive')) {
      proposedPlan.tone = 'Energetic';
      proposedPlan.interactionVariety = 'Excellent';
      proposedPlan.estimatedEngagement = Math.min(100, proposedPlan.estimatedEngagement + 10);
      diffSummary.push('Changed session tone to Energetic.');
      diffSummary.push('Boosted expected engagement score.');
      proposedPlan.agenda.splice(1, 0, {
        id: `item-new-${Date.now()}`,
        timeOffsetMinutes: 5,
        title: 'Quick Fun Poll',
        durationMinutes: 5,
        purpose: 'engagement'
      });
      diffSummary.push('Added a new engagement slot to the agenda.');
    } else {
      proposedPlan.objective = `${proposedPlan.objective} (Modified based on: "${intent}")`;
      diffSummary.push('Updated session objective based on request.');
      if (proposedPlan.agenda.length > 0) {
        proposedPlan.agenda[0]!.title = `[Updated] ${proposedPlan.agenda[0]!.title}`;
        diffSummary.push('Modified the opening agenda item.');
      }
    }

    return { 
      newPlan: proposedPlan, 
      diffSummary,
      reasoning: 'Mock reasoning based on intent',
      confidence: 85,
      affectedActivities: [],
      estimatedImpact: 'Moderate'
    };
  }

  async evaluateSession(plan: SessionPlan, drafts: DraftActivity[]): Promise<SessionReview> {
    await new Promise(r => setTimeout(r, 600));

    const findings: ReviewFinding[] = [];
    const activityReviews: Record<string, any> = {};

    drafts.forEach((draft) => {
      const readingTime = Math.max(5, Math.floor((draft.description?.length || 20) / 10));
      let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy';
      if (draft.type === 'quiz') difficulty = 'Medium';
      if (draft.type === 'survey' && readingTime > 15) difficulty = 'Hard';

      const actFindings: ReviewFinding[] = [];
      if (draft.type === 'quiz' && difficulty === 'Medium') {
        actFindings.push({
          id: `f-act-${draft.id}-1`,
          category: 'Question Quality',
          severity: 'low',
          reason: 'Question might be slightly ambiguous.',
          evidence: `Activity: ${draft.title}`,
          suggestedFix: 'Clarify the wording to reduce cognitive load.'
        });
      }

      activityReviews[draft.id] = {
        activityId: draft.id,
        quality: 85 + Math.floor(Math.random() * 10),
        readingTimeSec: readingTime,
        bias: 'None',
        difficulty,
        recommendations: actFindings
      };
    });

    const quizCount = drafts.filter(d => d.type === 'quiz').length;
    if (quizCount > 2) {
      const proposedPlan = JSON.parse(JSON.stringify(plan));
      findings.push({
        id: 'f-session-1',
        category: 'Audience Fatigue',
        severity: 'medium',
        reason: 'Too many quizzes back-to-back.',
        evidence: `${quizCount} quizzes detected in a short timespan.`,
        suggestedFix: 'Convert one quiz into an open-ended Q&A.',
        proposedChange: {
          id: `prop-rev-${Date.now()}`,
          originalPlan: plan,
          proposedPlan: proposedPlan,
          diffSummary: ['Converted Quiz #2 to Q&A to reduce fatigue.'],
          status: 'pending'
        }
      });
    }

    if (plan.agenda.length > 0 && plan.agenda[plan.agenda.length - 1]!.purpose !== 'closing') {
      findings.push({
        id: 'f-session-2',
        category: 'Closing Quality',
        severity: 'high',
        reason: 'Missing a dedicated feedback/closing block.',
        evidence: 'The final agenda item is not marked as a closing activity.',
        suggestedFix: 'Move feedback to the end or add a closing summary.'
      });
    }

    const categoryScores = [
      { label: 'Audience Match', score: 95 },
      { label: 'Flow', score: 89 - (findings.length * 2) },
      { label: 'Engagement', score: 93 },
      { label: 'Variety', score: plan.interactionVariety === 'Excellent' ? 95 : 82 },
      { label: 'Duration', score: plan.durationFit || 90 },
    ];

    const overallScore = Math.round(categoryScores.reduce((acc, curr) => acc + curr.score, 0) / categoryScores.length);

    return {
      overallScore,
      categoryScores,
      health: {
        engagementPrediction: plan.estimatedEngagement || 85,
        audienceFatigue: quizCount > 2 ? 'High Risk' : 'Low',
        varietyIndex: drafts.length > 0 ? new Set(drafts.map(d => d.type)).size / drafts.length : 0
      },
      findings,
      activityReviews
    };
  }

  async generatePostEventIntelligence(eventId: string, contextData?: any): Promise<PostEventIntelligence> {
    await this.simulateDelay(1800);

    return {
      id: `intel-${Date.now()}`,
      eventId,
      executiveSummary: {
        meetingGoal: 'To align the engineering organization on Q3 objectives and address technical debt concerns.',
        overallSuccess: 'Highly Successful. Achieved high participation rates and surfaced critical feedback regarding deployment pipelines.',
        participationOverview: '85% of invited engineers attended (142 participants). 92% interacted with at least one activity.',
        majorOutcomes: 'Identified CI/CD pipelines as the primary bottleneck. Strong alignment on shifting resources to developer experience.',
        criticalObservations: 'Sentiment dropped significantly when discussing current on-call rotations, indicating burnout risk.',
        keyRecommendations: 'Prioritize dev-ex sprint immediately. Schedule follow-up roundtables on on-call compensation.'
      },
      keyTakeaways: [
        'Developer experience is the top priority for 65% of the team.',
        'Current on-call load is causing measurable frustration.',
        'The new QA automation strategy was received very positively.',
        'Significant confusion remains regarding the Q3 roadmap timeline.'
      ],
      actionItems: [
        {
          id: 'ai-1',
          title: 'Draft proposal for new on-call rotation',
          description: 'Create a more balanced on-call schedule addressing burnout concerns raised during Q&A.',
          priority: 'High',
          owner: 'Engineering Leadership',
          reason: 'High volume of negative sentiment around current on-call structure.',
          confidence: 95,
          status: 'Pending'
        },
        {
          id: 'ai-2',
          title: 'Schedule deep-dive on Q3 Timeline',
          description: 'Host a 30-minute session to clarify the roadmap dates.',
          priority: 'Medium',
          owner: 'Product Team',
          reason: 'Poll results showed 40% of team members felt the timeline was unclear.',
          confidence: 85,
          status: 'Pending'
        }
      ],
      topicAnalysis: [
        {
          name: 'Developer Experience',
          mentions: 48,
          sentiment: 'Negative',
          importance: 'High',
          trend: 'Up',
          quotes: ['Build times are unacceptable.', 'We need better local tooling.']
        },
        {
          name: 'QA Automation',
          mentions: 32,
          sentiment: 'Positive',
          importance: 'Medium',
          trend: 'Up',
          quotes: ['Love the new playwright setup!', 'This will save us so much time.']
        }
      ],
      sentimentIntelligence: {
        overall: 'Cautiously Optimistic',
        distribution: [
          { emotion: 'Excitement', percentage: 40 },
          { emotion: 'Frustration', percentage: 35 },
          { emotion: 'Curiosity', percentage: 15 },
          { emotion: 'Confusion', percentage: 10 }
        ]
      },
      engagementJourney: [
        { time: '0:05', description: 'Strong opening engagement during the icebreaker poll.', impact: 'Positive' },
        { time: '0:25', description: 'Engagement dipped during the extended architectural review presentation.', impact: 'Negative' },
        { time: '0:45', description: 'Massive spike in participation during the anonymous Q&A session.', impact: 'Positive' }
      ],
      recommendations: [
        'Shorten the architectural review section in future all-hands to max 15 minutes.',
        'Continue using anonymous Q&A; it generated the most valuable insights.',
        'Address the on-call concerns explicitly in next week\'s update.'
      ],
      followUpSuggestions: [
        'Send out a detailed Q3 timeline document.',
        'Create a dedicated Slack channel for dev-ex improvements.',
        'Run a follow-up survey specifically targeting on-call health.'
      ],
      crossActivityAnalysis: {
        mostEngaging: 'Anonymous Q&A',
        lowestCompletion: 'End of session long-form feedback survey',
        mostDiscussedTopic: 'Developer Tooling'
      }
    };
  }

  async analyzeLiveEvent(eventId: string, currentContext?: any): Promise<LiveAssistantState> {
    await this.simulateDelay(500);
    return {
      eventId,
      metrics: {
        participationRate: 78,
        averageResponseTimeSec: 12,
        audienceActivityLevel: 'High',
        momentum: 'Increasing',
        silenceDetected: false,
        engagementTrend: 'Up',
      },
      mood: {
        primary: 'Curious',
        trend: 'Improving',
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'info',
          message: 'Participation has increased by 15% in the last 5 minutes.',
        },
        {
          id: 'alert-2',
          type: 'warning',
          message: 'Response velocity on the current poll is slowing down.',
        }
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Launch a quick Q&A',
          description: 'The audience is curious about the recent topic. Open Q&A to address questions.',
        },
        {
          id: 'rec-2',
          title: 'Move to the next section',
          description: 'You are slightly behind schedule. Consider skipping the next poll.',
        }
      ],
      questionClusters: [
        {
          id: 'cluster-1',
          topic: 'Pricing Details',
          questionIds: ['q1', 'q2', 'q3'],
          sentiment: 'Neutral',
          isPriority: true,
        },
        {
          id: 'cluster-2',
          topic: 'Integration Support',
          questionIds: ['q4', 'q5'],
          sentiment: 'Positive',
          isPriority: false,
        }
      ],
      liveSummary: 'The session started with high engagement during the intro poll. The current topic on "Architecture" has generated 5 new questions, mostly focused on Pricing and Integration.',
      timeRemainingSec: 1500,
    };
  }
}
