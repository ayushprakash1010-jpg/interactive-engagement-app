import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('knowledge')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  createArticle(@Body() dto: CreateArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.create(dto, user);
  }

  @Get()
  getArticles(@Query() query: any) {
    return this.knowledgeService.findAll(query);
  }

  @Get(':slug')
  getArticle(@Param('slug') slug: string) {
    return this.knowledgeService.findOne(slug);
  }

  @Patch(':slug')
  updateArticle(
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.knowledgeService.update(slug, dto, user);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArticle(@Param('slug') slug: string, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.remove(slug, user);
  }
}
