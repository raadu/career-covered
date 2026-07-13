import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoverLetterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty({ example: 'Google' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'Paste job description...' })
  @IsString()
  @IsNotEmpty()
  jobDescription: string;

  @ApiProperty({ example: 'Dear Hiring Manager...' })
  @IsString()
  @IsNotEmpty()
  generatedText: string;

  @ApiProperty({ example: 'llama-3.3-70b-versatile' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wordLimit?: number;
}
