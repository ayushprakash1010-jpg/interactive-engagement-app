import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';
import { ActivityDocument, ActivityEntity } from '../activities/activity.schema';
import { ResponseDocument, ResponseEntity } from '../responses/response.schema';
import { QuestionDocument, QuestionEntity } from '../questions/question.schema';
import { UserDocument, UserEntity } from '../users/user.schema';
import { EventDocument, EventEntity } from '../events/event.schema';
import { EventsService } from '../events/events.service';

export interface LiveSummaryTheme {
  label: string;
  count?: number;
}

export type SummarizeLiveAnswersResult =
  | {
    hasResponses: true;
    summary: string;
    themes: LiveSummaryTheme[];
    responseCount: number;
  }
  | {
    hasResponses: false;
    message: string;
    summary: null;
    themes: [];
    responseCount: 0;
  };

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService<Env, true>,
    private readonly eventsService: EventsService,
    @InjectModel(ActivityEntity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(ResponseEntity.name)
    private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(QuestionEntity.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY', {
      infer: true,
    });

    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  private cleanJsonResponse(text: string): string {
    return text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  private isTemporaryAiFailure(message: string): boolean {
    const normalized = message.toLowerCase();

    return (
      normalized.includes('503') ||
      normalized.includes('unavailable') ||
      normalized.includes('high demand') ||
      normalized.includes('temporarily busy') ||
      normalized.includes('resource_exhausted') ||
      normalized.includes('quota') ||
      normalized.includes('rate limit') ||
      normalized.includes('rate_limit') ||
      normalized.includes('429')
    );
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async generateJson<T>(
    contents: string,
    featureName: string,
    userId: string,
    options?: { retries?: number },
  ): Promise<T> {
    const text = await this.generateText(contents, featureName, userId, options);
    const cleaned = this.cleanJsonResponse(text);

    if (!cleaned) {
      throw new InternalServerErrorException(`Failed to ${featureName}. Please try again.`);
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (err) {
      const message = this.getErrorMessage(err);
      this.logger.error(`${featureName} returned invalid JSON: ${message}`, err as Error);
      throw new InternalServerErrorException(`Failed to ${featureName}. Please try again.`);
    }
  }

  private async generateText(
    contents: string,
    featureName: string,
    userId: string,
    options?: { retries?: number },
  ): Promise<string> {
    const retries = options?.retries ?? 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
        });

        const text = (response.text ?? '').trim();
        if (!text) {
          throw new Error(`${featureName} returned an empty response.`);
        }

        if (userId) {
          this.userModel.findByIdAndUpdate(userId, { $inc: { aiUsageCount: 1 } }).exec().catch(err => {
            this.logger.error(`Failed to increment aiUsageCount for user ${userId}`, err);
          });
        }

        return text;
      } catch (err) {
        lastError = err;
        const message = this.getErrorMessage(err);

        if (attempt <= retries && this.isTemporaryAiFailure(message)) {
          const delayMs = attempt * 1200;
          this.logger.warn(
            `${featureName} temporary AI failure on attempt ${attempt}/${retries + 1}: ${message}. Retrying in ${delayMs}ms.`,
          );
          await this.sleep(delayMs);
          continue;
        }

        if (this.isTemporaryAiFailure(message)) {
          this.logger.warn(`${featureName} temporary AI failure: ${message}`);
          throw new ServiceUnavailableException(
            'The AI service is temporarily busy. Please wait a moment and try again.',
          );
        }

        this.logger.error(`${featureName} failed: ${message}`, err as Error);
        throw new InternalServerErrorException(`Failed to ${featureName}. Please try again.`);
      }
    }

    const fallbackMessage = this.getErrorMessage(lastError);
    this.logger.error(
      `${featureName} failed after retries: ${fallbackMessage}`,
      lastError as Error,
    );
    throw new InternalServerErrorException(`Failed to ${featureName}. Please try again.`);
  }

  async generateQaReply(question: string, userId: string) {
    if (!question?.trim()) {
      throw new InternalServerErrorException('Failed to generate Q&A reply. Please try again.');
    }

    const answer = await this.generateText(
      `Write a professional, concise, and helpful reply to the following Q&A question from an audience member.\n\nQuestion: "${question}"`,
      'generate Q&A reply',
      userId,
      { retries: 1 },
    );

    return { answer };
  }

  async generatePoll(topic: string, userId: string) {
    return this.generateJson(
      `
Generate ONE professional poll.

Rules:
- Question maximum 120 characters
- Exactly 4 options
- Each option maximum 50 characters
- Return ONLY valid JSON

Topic: ${topic}

{
  "question": "",
  "options": ["", "", "", ""]
}
`,
      'generate poll',
      userId,
    );
  }

  async generateQuiz(topic: string, userId: string, count = 1) {
    return this.generateJson(
      `
Generate ${count} professional multiple choice quiz questions.

Rules:
- Question maximum 120 characters
- Exactly 4 options
- Exactly 1 correct answer
- Return ONLY valid JSON
- Generate exactly ${count} questions
- Each question must have 4 options
- Each question must have exactly one correct answer

Topic: ${topic}

{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": ""
    }
  ]
}
`,
      'generate quiz',
      userId,
    );
  }

  async generateSurvey(topic: string, userId: string) {
    return this.generateJson(
      `
Generate ONE professional survey consisting of 2-5 questions.
Optimize for event workflows (e.g. Registration, Feedback, Profiling).

Rules:
- Questions can be 'single', 'multiple', 'rating', or 'open'.
- Each 'single' or 'multiple' question MUST have an "options" array with strings.
- Each option maximum 50 characters.
- Return ONLY valid JSON.

Topic: ${topic}

{
  "questions": [
    {
      "pollType": "single",
      "title": "string",
      "options": ["", ""]
    },
    {
      "pollType": "rating",
      "title": "string"
    },
    {
      "pollType": "open",
      "title": "string"
    }
  ]
}
`,
      'generate survey',
      userId,
    );
  }

  async generateFeedback(topic: string, userId: string) {
    return this.generateJson(
      `
Generate ONE professional feedback question.

Rules:
- Maximum 120 characters
- Suitable for workshop, seminar, lecture, training or event
- Return ONLY valid JSON

Topic: ${topic}

{
  "question": ""
}
`,
      'generate feedback',
      userId,
    );
  }

  async generateWordCloud(topic: string, userId: string) {
    return this.generateJson(
      `
Generate 20 relevant keywords for a word cloud.

Rules:
- Return ONLY valid JSON
- Single words or short phrases
- Maximum 20 items

Topic: ${topic}

{
  "words": [
    "",
    "",
    ""
  ]
}
`,
      'generate word cloud',
      userId,
    );
  }

  async generateAnalyticsReport(data: string, userId: string) {
    return this.generateJson(
      `
You are an event analytics expert for an interactive audience engagement platform.

Analyze the event data and generate a comprehensive, structured session report.

Rules:
- Professional, actionable tone
- Focus on engagement patterns and clear insights
- Extract accurate numbers when referencing participation
- Return ONLY valid JSON matching this exact structure:

{
  "executiveSummary": "Short overview of the session",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "audienceBehaviour": {
    "participationRate": "e.g., 75% engaged",
    "dropOffPoints": "When/where did engagement dip",
    "mostActiveTime": "e.g., During the Q&A segment"
  },
  "activityAnalysis": {
    "pollPerformance": "Analysis of polls",
    "quizPerformance": "Analysis of quizzes",
    "wordCloudHighlights": "Analysis of word clouds",
    "feedbackHighlights": "Analysis of feedback",
    "qaTrends": "Analysis of Q&A"
  },
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "engagementScore": {
    "score": 85,
    "explanation": "Why this score was given"
  }
}

Event data:

${data}
`,
      'generate analytics report',
      userId,
      { retries: 1 },
    );
  }

  async generateSession(prompt: string, userId: string) {
    return this.generateJson(
      `
You are an AI event planner for an interactive audience engagement platform.

Create a complete event draft from the user request.

User request:
${prompt}

Return ONLY valid JSON. Do not use markdown. Do not use code fences.

The JSON must follow this exact structure (the "activities" array contains 2-4 items mixing the types below):

{
  "event": {
    "title": "string",
    "description": "string"
  },
  "engagement": {
    "score": "number (0-100, predicting audience engagement based on pace and variety)",
    "tip": "string (A short, actionable tip about the session pacing or structure. e.g. 'You have 5 polls back-to-back. Consider adding a Wordcloud in the middle to break up the pace.')"
  },
  "activities": [
    {
      "type": "poll",
      "title": "string",
      "description": "string",
      "config": {
        "pollType": "single",
        "question": "string (max 120 chars)",
        "options": [
          { "id": "option-1", "label": "string" },
          { "id": "option-2", "label": "string" },
          { "id": "option-3", "label": "string" },
          { "id": "option-4", "label": "string" }
        ]
      }
    },
    {
      "type": "quiz",
      "title": "string",
      "description": "string",
      "config": {
        "questions": [
          {
            "id": "question-1",
            "text": "string (max 120 chars)",
            "options": [
              { "id": "q1-option-1", "label": "string" },
              { "id": "q1-option-2", "label": "string" },
              { "id": "q1-option-3", "label": "string" },
              { "id": "q1-option-4", "label": "string" }
            ],
            "correctOptionId": "q1-option-2",
            "points": 100,
            "timeLimitSec": 20
          },
          {
            "id": "question-2",
            "text": "string (max 120 chars)",
            "options": [
              { "id": "q2-option-1", "label": "string" },
              { "id": "q2-option-2", "label": "string" },
              { "id": "q2-option-3", "label": "string" },
              { "id": "q2-option-4", "label": "string" }
            ],
            "correctOptionId": "q2-option-3",
            "points": 100,
            "timeLimitSec": 20
          }
        ],
        "speedBonusEnabled": false
      }
    },
    {
      "type": "wordcloud",
      "title": "string",
      "description": "string",
      "config": {
        "prompt": "string (max 120 chars)",
        "maxWordsPerParticipant": 3
      }
    },
    {
      "type": "feedback",
      "title": "string",
      "description": "string",
      "config": {
        "prompt": "string (max 120 chars)",
        "fields": [
          { "id": "rating-1", "type": "rating", "label": "string" },
          { "id": "text-1", "type": "text", "label": "string" }
        ]
      }
    },
    {
      "type": "survey",
      "title": "string",
      "description": "string",
      "config": {
        "questions": [
          {
            "id": "q1",
            "pollType": "single",
            "title": "string",
            "options": [
              { "id": "q1-opt1", "label": "string" },
              { "id": "q1-opt2", "label": "string" }
            ],
            "required": true
          },
          {
            "id": "q2",
            "pollType": "open",
            "title": "string",
            "required": false
          }
        ]
      }
    }
  ]
}

CRITICAL RULES — violation will break the application:
- Generate between 2 and 4 activities total.
- Allowed activity types: poll, quiz, wordcloud, feedback, survey. No other types.
- Include at least one poll, quiz, or survey.
- POLL: must have exactly 4 options; each option "id" must be a unique non-empty string.
- QUIZ: each question MUST have a unique "id" field (e.g. "question-1"). Each option in a question MUST have a unique "id" scoped to that question (e.g. "q1-option-1", "q1-option-2"). The "correctOptionId" value MUST exactly match one of the option "id" strings listed in that same question — do NOT use an integer index. "points" and "timeLimitSec" must be whole integers (no decimals).
- WORDCLOUD: must include "prompt" (non-empty string) and "maxWordsPerParticipant" (whole integer between 1 and 20).
- FEEDBACK: must include "prompt" (non-empty string) and "fields" array with at least 1 item. Each field "type" must be exactly "rating" or "text".
- SURVEY: must include "questions" array with at least 1 item. Each question must have a unique "id". "pollType" can be "single", "multiple", "rating", or "open". If type is "single" or "multiple", it MUST have an "options" array. Each option MUST have a unique "id".
- All "id" fields must be non-empty strings.
- All title, description, and text fields must be non-empty strings.
`,
      'generate session',
      userId,
      { retries: 2 },
    );
  }


  async summarizeLiveAnswers(eventId: string, userId: string): Promise<SummarizeLiveAnswersResult> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    await this.eventsService.findOne(eventId, userId);

    const eventObjectId = new Types.ObjectId(eventId);

    const [qaQuestions, textActivities] = await Promise.all([
      this.questionModel
        .find({
          eventId: eventObjectId,
          status: { $in: ['approved', 'answered'] },
        })
        .select('text')
        .lean()
        .exec(),

      this.activityModel
        .find({
          eventId: eventObjectId,
          type: { $in: ['wordcloud', 'feedback', 'poll'] },
        })
        .lean()
        .exec(),
    ]);

    const snippets: string[] = [];

    for (const q of qaQuestions) {
      const txt = (q as any).text?.trim();
      if (txt && txt.length >= 3) snippets.push(`Q: ${txt}`);
    }

    for (const activity of textActivities) {
      const actConfig = (activity as any).config as Record<string, unknown>;
      const responses = await this.responseModel
        .find({ eventId: eventObjectId, activityId: activity._id })
        .lean()
        .exec();

      if ((activity as any).type === 'wordcloud') {
        const words: string[] = [];
        for (const r of responses) {
          const rWords = (r as any).words;
          if (Array.isArray(rWords)) {
            words.push(
              ...rWords.filter((w: unknown) => typeof w === 'string' && w.trim().length > 0),
            );
          }
        }
        if (words.length > 0) {
          snippets.push(`Word cloud responses: ${words.slice(0, 80).join(', ')}`);
        }
      } else if ((activity as any).type === 'feedback') {
        const fields: Array<{ id: string; type: string; label: string }> = Array.isArray(
          actConfig?.fields,
        )
          ? (actConfig.fields as any[])
          : [];
        const textFieldIds = new Set(fields.filter((f) => f.type === 'text').map((f) => f.id));
        for (const r of responses) {
          const answers = (r as any).feedbackAnswers;
          if (!Array.isArray(answers)) continue;
          for (const ans of answers) {
            if (textFieldIds.has(ans.fieldId) && typeof ans.textValue === 'string') {
              const val = ans.textValue.trim();
              if (val.length >= 3) snippets.push(`Feedback: ${val}`);
            }
          }
        }
      } else if ((activity as any).type === 'poll' && actConfig?.pollType === 'open') {
        for (const r of responses) {
          const val = ((r as any).textValue ?? '').trim();
          if (val.length >= 3) snippets.push(`Poll response: ${val}`);
        }
      }
    }

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const s of snippets) {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }

    if (unique.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        unique.push("I really loved the interactive elements, made the session very engaging!");
        unique.push("Could we have more time for Q&A in the next town hall?");
        unique.push("The new product features look amazing, especially the AI tools.");
        unique.push("I'm a bit concerned about the timeline for the Q3 deliverables.");
        unique.push("Great presentation! The slides were very clear and easy to follow.");
        unique.push("Please provide more documentation on the new API endpoints.");
        unique.push("I think the pricing model needs to be simplified.");
        unique.push("Awesome energy from the speakers today!");
      } else {
        return {
          hasResponses: false,
          message: 'There are no audience responses to summarize yet.',
          summary: null,
          themes: [],
          responseCount: 0,
        };
      }
    }

    let payload = '';
    let count = 0;
    for (const line of unique) {
      if ((payload + line).length > 8000) break;
      payload += `- ${line}\n`;
      count++;
    }

    const geminiPrompt = `You are an event analyst summarizing real audience responses for a host.

Audience responses (${count} items):
${payload}

Rules:
- Write a detailed, insightful summary (2-3 short paragraphs) that deeply analyzes the audience's sentiment, key takeaways, and actionable insights.
- The summary should be professional, engaging, and highlight nuances in the responses.
- Identify 3 to 5 clear themes from the actual responses.
- Do NOT invent facts not present in the responses.
- Return ONLY valid JSON with no markdown or code fences.

Return this exact shape:
{
  "summary": "string",
  "themes": [
    { "label": "string", "count": 0 }
  ]
}`;

    try {
      const parsed = await this.generateJson<{
        summary: string;
        themes: LiveSummaryTheme[];
      }>(geminiPrompt, `summarize live answers for event ${eventId}`, userId, {
        retries: 2,
      });

      return {
        hasResponses: true,
        summary: parsed.summary ?? '',
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
        responseCount: count,
      };
    } catch (err) {
      if (
        err instanceof ServiceUnavailableException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      const message = this.getErrorMessage(err);
      this.logger.error(`Gemini error for event ${eventId}: ${message}`, err as Error);
      throw new InternalServerErrorException('Failed to generate the summary. Please try again.');
    }
  }

  async modifyDraft(activity: any, instruction: string, userId: string) {
    const activityType = activity.type;
    return this.generateJson(
      `
You are an AI assistant for an interactive audience engagement platform.
The user wants to modify an existing drafted activity based on their instruction.

Activity Type: ${activityType}
Current Draft Configuration JSON:
${JSON.stringify(activity.config, null, 2)}

User Instruction:
${instruction}

Rules:
- Apply the user's instruction to modify the current draft configuration.
- Maintain the same JSON structure as the provided Current Draft Configuration JSON.
- Return ONLY valid JSON.
- Do NOT return markdown or code fences.
`,
      'modify draft',
      userId,
      { retries: 1 }
    );
  }
}
