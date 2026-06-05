import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestionsService } from './questions.service';

@Controller('events/:eventId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllForHost(@Param('eventId') eventId: string) {
    return this.questionsService.findByEvent(eventId);
  }

  @Get('public')
  findApprovedForPublic(@Param('eventId') eventId: string) {
    return this.questionsService.findApprovedByEvent(eventId);
  }
}