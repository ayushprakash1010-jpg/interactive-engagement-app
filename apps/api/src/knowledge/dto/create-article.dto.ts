import { IsArray, IsEnum, IsNotEmpty, IsString, MaxLength, Matches, IsIn, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  summary!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'Account & Authentication',
    'Events',
    'Integrations',
    'AI Studio',
    'Feature Flags',
    'Organizations',
    'Billing & Plans',
    'Troubleshooting',
    'System Operations',
    'Other',
  ])
  category!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags!: string[];

  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status!: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
