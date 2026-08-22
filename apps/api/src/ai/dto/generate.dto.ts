import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_MODEL_IDS } from '../allowed-models';

export class ChatMessageDto {
  @ApiProperty({ example: 'user', enum: ['system', 'user', 'assistant'] })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ example: 'Write a cover letter for...' })
  @IsString()
  @MaxLength(50_000)
  content: string;
}

export class GenerateDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiProperty({
    example: 'openai/gpt-oss-120b',
    enum: ALLOWED_MODEL_IDS,
  })
  @IsIn(ALLOWED_MODEL_IDS)
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

  @ApiPropertyOptional({
    description: 'Caller can supply their own Groq API key',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  userApiKey?: string;

  @ApiPropertyOptional({ description: 'Job description' })
  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  jobDescription?: string;

  @ApiPropertyOptional({ description: 'Template ID if saved in db' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateId?: string;

  @ApiPropertyOptional({ description: 'Target job title' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Target company name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
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
