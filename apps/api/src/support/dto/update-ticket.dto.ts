import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  resolutionNote?: string;
}

export class AddNoteDto {
  @IsString()
  @IsNotEmpty()
  note!: string;
}
