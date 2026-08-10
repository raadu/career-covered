import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import * as express from 'express';
import { ResumeService } from './resume.service';
import {
  RenameResumeDto,
  ReorderResumesDto,
  BatchDeleteResumeDto,
  type ResumeResponseDto,
} from './dto/resume.dto';
import { MulterExceptionFilter } from './multer-exception.filter';
import { buildContentDisposition } from './content-disposition';
import { MAX_RESUME_BYTES } from './resume.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as db from '@career-covered/db';

const uploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
});

@ApiTags('Resumes')
@ApiCookieAuth('session')
@Controller('api/resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  @ApiOperation({ summary: "List the user's resumes, in order" })
  async findAll(@CurrentUser() user: db.User): Promise<ResumeResponseDto[]> {
    return this.resumeService.findAll(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new resume (PDF, max 8 per user)' })
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(uploadInterceptor)
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string | undefined,
    @CurrentUser() user: db.User,
  ): Promise<ResumeResponseDto> {
    if (!file) {
      throw new BadRequestException('A PDF file is required');
    }
    return this.resumeService.create(user.id, file, name);
  }

  @Post(':id/replace')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Replace a resume's file, keeping its name and position",
  })
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(uploadInterceptor)
  async replace(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: db.User,
  ): Promise<ResumeResponseDto> {
    if (!file) {
      throw new BadRequestException('A PDF file is required');
    }
    return this.resumeService.replace(id, user.id, file);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Persist a new resume ordering' })
  async reorder(
    @Body() dto: ReorderResumesDto,
    @CurrentUser() user: db.User,
  ): Promise<ResumeResponseDto[]> {
    return this.resumeService.reorder(user.id, dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a resume' })
  async rename(
    @Param('id') id: string,
    @Body() dto: RenameResumeDto,
    @CurrentUser() user: db.User,
  ): Promise<ResumeResponseDto> {
    return this.resumeService.rename(id, user.id, dto.name);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete multiple resumes by IDs' })
  async removeBatch(
    @Body() dto: BatchDeleteResumeDto,
    @CurrentUser() user: db.User,
  ): Promise<void> {
    return this.resumeService.removeBatch(dto.ids, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resume' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
  ): Promise<void> {
    return this.resumeService.remove(id, user.id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Stream the PDF inline, for the preview modal' })
  async preview(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
    @Res() res: express.Response,
  ): Promise<void> {
    await this.streamFile(id, user, res, 'inline');
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Stream the PDF as an attachment' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
    @Res() res: express.Response,
  ): Promise<void> {
    await this.streamFile(id, user, res, 'attachment');
  }

  private async streamFile(
    id: string,
    user: db.User,
    res: express.Response,
    disposition: 'inline' | 'attachment',
  ): Promise<void> {
    const { stream, contentType, contentLength, resume } =
      await this.resumeService.getFileStream(id, user.id);

    res.set({
      'Content-Type': contentType ?? 'application/pdf',
      'Content-Disposition': buildContentDisposition(
        disposition,
        resume.originalFileName,
      ),
      ...(contentLength ? { 'Content-Length': String(contentLength) } : {}),
      // Intentionally scoped to same-origin — not left to whatever the
      // app's global defaults happen to be — so the preview <iframe> can
      // always render without opening this endpoint up to being framed
      // from arbitrary third-party sites.
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors 'self'",
    });

    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }
}
