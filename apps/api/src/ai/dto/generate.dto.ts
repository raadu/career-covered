import { IsString, IsOptional, IsNumber, Min, Max, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'user', enum: ['system', 'user', 'assistant'] })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ example: 'Write a cover letter for...' })
  @IsString()
  content: string;
}

export class GenerateDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiProperty({ example: 'llama-3.3-70b-versatile' })
  @IsString()
  model: string;

  @ApiPropertyOptional({ example: 1024, minimum: 64, maximum: 8192 })
  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(8192)
  max_tokens?: number;

  @ApiPropertyOptional({ example: 0.7 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Caller can supply their own Groq API key' })
  @IsOptional()
  @IsString()
  userApiKey?: string;

  @ApiPropertyOptional({ description: 'Job description' })
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional({ description: 'Template ID if saved in db' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Target job title' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Target company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Word limit rule' })
  @IsOptional()
  @IsNumber()
  wordLimit?: number;

  @ApiPropertyOptional({ description: 'Minimal changes rule flag' })
  @IsOptional()
  @IsBoolean()
  minimalChanges?: boolean;

  @ApiPropertyOptional({ description: 'Same language rule flag' })
  @IsOptional()
  @IsBoolean()
  sameLanguage?: boolean;
}

