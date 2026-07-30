import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoverLetterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generatedText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wordLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  minimalChanges?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sameLanguage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobMarket?: string;
}

export class UpdateCoverLetterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generatedText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wordLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  minimalChanges?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sameLanguage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobMarket?: string;
}

export class BatchDeleteCoverLetterDto {
  @IsString({ each: true })
  ids: string[];
}
