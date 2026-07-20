import { Body, Controller, Param, Post, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RateLimitService } from '../realtime/rate-limit.service';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly rateLimitService: RateLimitService,
  ) { }

  private getUser(req: Request): { id: string; organizationId?: string } {
    const user = req.user as { id?: string; _id?: string; organizationId?: string };
    return {
      id: user.id ?? user._id ?? '',
      organizationId: user.organizationId,
    };
  }

  private async checkRateLimit(user: { id: string, organizationId?: string }, featureName: string) {
    if (!user.id) return;
    const result = await this.rateLimitService.consume(`ai_operations:user:${user.id}`, 10, 60); // 10 requests per minute
    if (!result.allowed) {
      this.aiService.logThrottledOperation(user.id, user.organizationId, featureName);
      throw new HttpException('Too many AI requests. Please wait a moment.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  @Post('generate-poll')
  async generatePoll(@Body() body: { topic: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate poll');
    return this.aiService.generatePoll(body.topic, user);
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
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate quiz');
    return this.aiService.generateQuiz(body.topic, user, body.count ?? 1);
  }

  @Post('generate-survey')
  async generateSurvey(@Body() body: { topic: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate survey');
    return this.aiService.generateSurvey(body.topic, user);
  }

  @Post('generate-feedback')
  async generateFeedback(@Body() body: { topic: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate feedback');
    return this.aiService.generateFeedback(body.topic, user);
  }

  @Post('generate-wordcloud')
  async generateWordCloud(@Body() body: { topic: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate wordcloud');
    return this.aiService.generateWordCloud(body.topic, user);
  }

  @Post('generate-analytics-report')
  async generateAnalyticsReport(@Body() body: { data: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate analytics report');
    return this.aiService.generateAnalyticsReport(body.data, user);
  }

  @Post('generate-qa-reply')
  async generateQaReply(@Body() body: { question: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate Q&A reply');
    return this.aiService.generateQaReply(body.question, user);
  }

  @Post('generate-session')
  async generateSession(@Body('prompt') prompt: string, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'generate session');
    return this.aiService.generateSession(prompt, user);
  }

  @Post('events/:eventId/summarize-live-answers')
  async summarizeLiveAnswers(@Param('eventId') eventId: string, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'summarize live answers');
    return this.aiService.summarizeLiveAnswers(eventId, user);
  }

  @Post('modify-draft')
  async modifyDraft(@Body() body: { activity: any; instruction: string }, @Req() req: Request) {
    const user = this.getUser(req);
    await this.checkRateLimit(user, 'modify draft');
    return this.aiService.modifyDraft(body.activity, body.instruction, user);
  }
}
