import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { CoverLetterService } from './cover-letter.service';
import {
  CreateCoverLetterDto,
  UpdateCoverLetterDto,
  BatchDeleteCoverLetterDto,
} from './dto/cover-letter.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as db from '@career-covered/db';

@ApiTags('Cover Letters')
@ApiCookieAuth('session')
@Controller('api/cover-letters')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Get()
  @ApiOperation({ summary: 'List cover letters for the user (supports pagination)' })
  async findAll(
    @CurrentUser() user: db.User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortByUpdateTime') sortByUpdateTime?: string,
  ): Promise<
    | db.CoverLetter[]
    | {
        data: db.CoverLetter[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
  > {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.coverLetterService.findAll(user.id, pageNum, limitNum);
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
  @ApiOperation({ summary: 'Save a cover letter' })
  async create(
    @Body() dto: CreateCoverLetterDto,
    @CurrentUser() user: db.User,
  ): Promise<db.CoverLetter> {
    return this.coverLetterService.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a cover letter' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCoverLetterDto,
    @CurrentUser() user: db.User,
  ): Promise<db.CoverLetter> {
    return this.coverLetterService.update(id, user.id, dto);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete multiple cover letters by IDs' })
  async removeBatch(
    @Body() body: BatchDeleteCoverLetterDto,
    @CurrentUser() user: db.User,
  ): Promise<void> {
    return this.coverLetterService.removeBatch(body.ids, user.id);
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
