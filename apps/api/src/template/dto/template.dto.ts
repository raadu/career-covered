import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'My Standard Template' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Dear Hiring Manager, I am excited to apply...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  content: string;
}

export class UpdateTemplateDto {
  @ApiProperty({ example: 'My Standard Template' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Dear Hiring Manager, I am excited to apply...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  content: string;
}

export class BatchDeleteTemplateDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids: string[];
}
