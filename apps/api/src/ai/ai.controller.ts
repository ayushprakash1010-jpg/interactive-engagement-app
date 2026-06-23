import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-poll')
  async generatePoll(@Body() body: { topic: string }) {
    return this.aiService.generatePoll(body.topic);
  }

  @Post('generate-quiz')
  async generateQuiz(
    @Body()
    body: {
      topic: string;
      count?: number;
    },
  ) {
    return this.aiService.generateQuiz(
      body.topic,
      body.count ?? 1,
  );
}

  @Post('generate-feedback')
  async generateFeedback(@Body() body: { topic: string }) {
    return this.aiService.generateFeedback(body.topic);
  }

  @Post('generate-wordcloud')
  async generateWordCloud(@Body() body: { topic: string }) {
    return this.aiService.generateWordCloud(body.topic);
  }

  @Post('generate-session-summary')
    async generateSessionSummary(
    @Body() body: { data: string },
    ) {
     return this.aiService.generateSessionSummary(body.data);
    }

    @Post('generate-insights')
    async generateInsights(
      @Body() body: { data: string },
  ) {
  return this.aiService.generateEventInsights(body.data);
  }
}