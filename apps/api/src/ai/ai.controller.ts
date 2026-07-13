import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('AI')
@Controller('api/generate')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a cover letter via Groq' })
  async generate(
    @Body() dto: GenerateDto,
    @Req() req: express.Request,
  ): Promise<unknown> {
    const sessionToken = req.cookies?.session as string | undefined;
    return this.aiService.generate(dto, sessionToken);
  }
}

