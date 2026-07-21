import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeArticleDocument, KnowledgeArticleEntity } from './schemas/knowledge-article.schema';
import { AdminService } from '../admin/admin.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(KnowledgeArticleEntity.name) private articleModel: Model<KnowledgeArticleDocument>,
    private adminService: AdminService,
  ) {}

  async create(dto: CreateArticleDto, adminUser: AuthenticatedUser): Promise<KnowledgeArticleDocument> {
    const existing = await this.articleModel.findOne({ slug: dto.slug });
    if (existing) {
      throw new ConflictException(`Article with slug '${dto.slug}' already exists`);
    }

    const authorId = new Types.ObjectId(adminUser.id);
    const article = new this.articleModel({
      ...dto,
      createdBy: authorId,
      updatedBy: authorId,
    });
    
    await article.save();

    await this.adminService.createAuditLog({
      adminId: adminUser.auth0Sub,
      adminEmail: adminUser.email || 'unknown',
      actionType: 'ARTICLE_CREATED',
      targetResourceId: article.id,
      targetResourceType: 'KnowledgeArticle',
      reason: `Created article: ${dto.title}`,
      metadata: {},
    });

    return article;
  }

  async findAll(query: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (query.category) {
      filter.category = query.category;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [items, total] = await Promise.all([
      this.articleModel.find(filter)
        .sort(query.search ? { score: { $meta: 'textScore' } } : { updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string): Promise<KnowledgeArticleDocument> {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (!article) {
      throw new NotFoundException(`Article ${slug} not found`);
    }
    return article;
  }

  async update(slug: string, dto: UpdateArticleDto, adminUser: AuthenticatedUser): Promise<KnowledgeArticleDocument> {
    const article = await this.findOne(slug);
    
    if (dto.slug && dto.slug !== slug) {
      const existing = await this.articleModel.findOne({ slug: dto.slug });
      if (existing) {
        throw new ConflictException(`Article with slug '${dto.slug}' already exists`);
      }
    }

    article.set(dto);
    article.updatedBy = new Types.ObjectId(adminUser.id);
    
    await article.save();

    await this.adminService.createAuditLog({
      adminId: adminUser.auth0Sub,
      adminEmail: adminUser.email || 'unknown',
      actionType: 'ARTICLE_UPDATED',
      targetResourceId: article.id,
      targetResourceType: 'KnowledgeArticle',
      reason: `Updated article: ${article.title}`,
      metadata: {},
    });

    return article;
  }

  async remove(slug: string, adminUser: AuthenticatedUser): Promise<void> {
    const article = await this.findOne(slug);
    await article.deleteOne();

    await this.adminService.createAuditLog({
      adminId: adminUser.auth0Sub,
      adminEmail: adminUser.email || 'unknown',
      actionType: 'ARTICLE_DELETED',
      targetResourceId: article.id,
      targetResourceType: 'KnowledgeArticle',
      reason: `Deleted article: ${article.title}`,
      metadata: {},
    });
  }
}
