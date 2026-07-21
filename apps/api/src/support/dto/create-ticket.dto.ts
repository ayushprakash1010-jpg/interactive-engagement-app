import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;
}
