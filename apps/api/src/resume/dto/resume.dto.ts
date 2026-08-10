import {
  IsArray,
  ArrayMaxSize,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_RESUMES_PER_USER } from '../resume.constants';

export class RenameResumeDto {
  @ApiProperty({ example: 'Software Engineer Resume 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}

export class ReorderResumesDto {
  @ApiProperty({
    type: [String],
    description: 'Full ordered list of the ids owned by the user',
  })
  @IsArray()
  @ArrayMaxSize(MAX_RESUMES_PER_USER)
  @IsString({ each: true })
  ids: string[];
}

export class BatchDeleteResumeDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(MAX_RESUMES_PER_USER)
  @IsString({ each: true })
  ids: string[];
}

export interface ResumeResponseDto {
  id: string;
  name: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}
