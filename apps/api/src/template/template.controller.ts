import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as db from '@career-covered/db';

@ApiTags('Templates')
@ApiCookieAuth('session')
@Controller('api/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List all custom templates for the user' })
  async findAll(@CurrentUser() user: db.User): Promise<db.Template[]> {
    return this.templateService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single template by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
  ): Promise<db.Template> {
    return this.templateService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new custom template' })
  async create(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: db.User,
  ): Promise<db.Template> {
    return this.templateService.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a custom template' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: db.User,
  ): Promise<db.Template> {
    return this.templateService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom template' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: db.User,
  ): Promise<void> {
    return this.templateService.remove(id, user.id);
  }
}
