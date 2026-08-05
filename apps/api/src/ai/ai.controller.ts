import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
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
  // Unauthenticated + falls back to the server's own Groq key when the
  // caller doesn't supply one — cap it tightly to bound cost/abuse.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async generate(@Body() dto: GenerateDto): Promise<unknown> {
    return this.aiService.generate(dto);
  }
}
