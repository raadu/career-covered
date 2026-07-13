import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'My Standard Template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Dear Hiring Manager, I am excited to apply...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateTemplateDto {
  @ApiProperty({ example: 'My Standard Template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Dear Hiring Manager, I am excited to apply...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
