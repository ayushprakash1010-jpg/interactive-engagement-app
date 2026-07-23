import { IsString, IsOptional, MaxLength, IsObject } from 'class-validator';

export class PageContextDto {
  @IsString()
  type!: 'user' | 'event' | 'ticket' | 'article' | 'live-session';

  @IsString()
  id!: string;
}

export class CopilotChatDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsObject()
  @IsOptional()
  pageContext?: PageContextDto;

  @IsString()
  @IsOptional()
  confirmActionId?: string;
}
