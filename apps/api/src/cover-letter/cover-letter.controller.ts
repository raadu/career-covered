import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { CoverLetterService } from './cover-letter.service';
import { CreateCoverLetterDto } from './dto/cover-letter.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as db from '@career-covered/db';

@ApiTags('Cover Letters')
@ApiCookieAuth('session')
@Controller('api/cover-letters')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Get()
  @ApiOperation({ summary: 'List all generated cover letters for the user' })
  async findAll(@CurrentUser() user: db.User): Promise<db.CoverLetter[]> {
    return this.coverLetterService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single cover letter by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
  ): Promise<db.CoverLetter> {
    return this.coverLetterService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a cover letter manually' })
  async create(
    @Body() dto: CreateCoverLetterDto,
    @CurrentUser() user: db.User,
  ): Promise<db.CoverLetter> {
    return this.coverLetterService.create(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a cover letter' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
  ): Promise<void> {
    return this.coverLetterService.remove(id, user.id);
  }
}
