import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { paginate, paginationSkip } from '../common/paginate';
import * as db from '@career-covered/db';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    page?: number,
    limit?: number,
    sortByUpdateTime?: boolean,
  ): Promise<
    | db.Template[]
    | {
        data: db.Template[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
  > {
    const orderBy = sortByUpdateTime
      ? { updatedAt: 'desc' as const }
      : { createdAt: 'desc' as const };
    if (page && limit) {
      const skip = paginationSkip(page, limit);
      return paginate(
        this.prisma,
        this.prisma.template.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.template.count({ where: { userId } }),
        page,
        limit,
      );
    }
    return this.prisma.template.findMany({
      where: { userId },
      orderBy,
    });
  }

  async findOne(id: string, userId: string): Promise<db.Template> {
    const template = await this.prisma.template.findFirst({
      where: { id, userId },
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async create(userId: string, dto: CreateTemplateDto): Promise<db.Template> {
    return this.prisma.template.create({
      data: {
        userId,
        name: dto.name,
        content: dto.content,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTemplateDto,
  ): Promise<db.Template> {
    // updateMany scopes by userId in the same query as the mutation itself,
    // so ownership is enforced atomically rather than by a separate check
    // beforehand (which a future refactor could otherwise decouple).
    const { count } = await this.prisma.template.updateMany({
      where: { id, userId },
      data: {
        name: dto.name,
        content: dto.content,
      },
    });
    if (count === 0) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const { count } = await this.prisma.template.deleteMany({
      where: { id, userId },
    });
    if (count === 0) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
  }

  async removeBatch(ids: string[], userId: string): Promise<void> {
    await this.prisma.template.deleteMany({
      where: { id: { in: ids }, userId },
    });
  }
}
