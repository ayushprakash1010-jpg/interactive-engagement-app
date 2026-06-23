import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;

  constructor(
  private readonly configService: ConfigService<Env, true>,
) {
  const apiKey = this.configService.get('GEMINI_API_KEY', {
    infer: true,
  });

  this.ai = new GoogleGenAI({
    apiKey,
  });
}

  async generatePoll(topic: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
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

Topic: ${topic}

Return ONLY valid JSON:

{
  "question": "",
  "options": ["", "", "", ""]
}
`,
    });

    const text = response.text ?? '';

    const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

    return JSON.parse(cleaned);
  }

  async generateQuiz(
    topic: string,
    count = 1,
  ) {
  const response = await this.ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
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
  });

  const text = response.text ?? '';

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
 }

 async generateFeedback(topic: string) {
  const response = await this.ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
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
  });

  const text = response.text ?? '';

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
 }

 async generateWordCloud(topic: string) {
  const response = await this.ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
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
  });

  const text = response.text ?? '';

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
}

    async generateSessionSummary(data: string) {
  const response = await this.ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
You are an event analyst.

Create a concise professional session summary.

Event data:

${data}

Return ONLY valid JSON:

{
  "summary": ""
}
`,
  });

  const text = response.text ?? '';

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
 }

 async generateEventInsights(data: string) {
  const response = await this.ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
You are an event analytics expert.

Analyze the event data and generate 3 to 5 key insights.

Rules:
- Short bullet points
- Professional tone
- Focus on engagement patterns
- Return ONLY valid JSON

Event data:

${data}

{
  "insights": [
    "",
    "",
    ""
  ]
}
`,
  });

  const text = response.text ?? '';

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
}

}