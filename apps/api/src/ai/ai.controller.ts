import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  private getUserId(req: Request): string {
    const user = req.user as { id?: string; _id?: string };
    return user.id ?? user._id ?? '';
  }

  @Post('generate-poll')
  async generatePoll(@Body() body: { topic: string }, @Req() req: Request) {
    return this.aiService.generatePoll(body.topic, this.getUserId(req));
  }

  @Post('generate-quiz')
  async generateQuiz(
    @Body()
    body: {
      topic: string;
      count?: number;
    },
    @Req() req: Request
  ) {
    return this.aiService.generateQuiz(body.topic, this.getUserId(req), body.count ?? 1);
  }

  @Post('generate-survey')
  async generateSurvey(@Body() body: { topic: string }, @Req() req: Request) {
    return this.aiService.generateSurvey(body.topic, this.getUserId(req));
  }

  @Post('generate-feedback')
  async generateFeedback(@Body() body: { topic: string }, @Req() req: Request) {
    return this.aiService.generateFeedback(body.topic, this.getUserId(req));
  }

  @Post('generate-wordcloud')
  async generateWordCloud(@Body() body: { topic: string }, @Req() req: Request) {
    return this.aiService.generateWordCloud(body.topic, this.getUserId(req));
  }

  @Post('generate-analytics-report')
  async generateAnalyticsReport(@Body() body: { data: string }, @Req() req: Request) {
    return this.aiService.generateAnalyticsReport(body.data, this.getUserId(req));
  }

  @Post('generate-qa-reply')
  async generateQaReply(@Body() body: { question: string }, @Req() req: Request) {
    return this.aiService.generateQaReply(body.question, this.getUserId(req));
  }

  @Post('generate-session')
  async generateSession(@Body('prompt') prompt: string, @Req() req: Request) {
    return this.aiService.generateSession(prompt, this.getUserId(req));
  }

  @Post('generate-activity-template')
  async generateActivityTemplate(@Body('topic') topic: string, @Req() req: Request) {
    return this.aiService.generateActivityTemplate(topic, this.getUserId(req));
  }

  @Post('export-session')
  async exportSession(
    @Body() body: { plan: any; drafts: any[] },
    @Req() req: Request
  ) {
    return this.aiService.exportSession(body.plan, body.drafts, this.getUserId(req));
  }

  @Post('events/:eventId/summarize-live-answers')
  async summarizeLiveAnswers(@Param('eventId') eventId: string, @Req() req: Request) {
    return this.aiService.summarizeLiveAnswers(eventId, this.getUserId(req));
  }

  @Post('modify-draft')
  async modifyDraft(@Body() body: { activity: any; instruction: string }, @Req() req: Request) {
    return this.aiService.modifyDraft(body.activity, body.instruction, this.getUserId(req));
  }
}
