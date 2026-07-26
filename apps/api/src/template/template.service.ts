import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import * as db from '@career-covered/db';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    page?: number,
    limit?: number,
    sortByUpdateTime?: boolean,
  ): Promise<db.Template[] | { data: db.Template[]; total: number; page: number; limit: number; totalPages: number }> {
    const orderBy = sortByUpdateTime ? { updatedAt: 'desc' as const } : { createdAt: 'desc' as const };
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await this.prisma.$transaction([
        this.prisma.template.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.template.count({ where: { userId } }),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

  async update(id: string, userId: string, dto: UpdateTemplateDto): Promise<db.Template> {
    await this.findOne(id, userId); // Ensure template exists and belongs to user
    return this.prisma.template.update({
      where: { id },
      data: {
        name: dto.name,
        content: dto.content,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // Ensure template exists and belongs to user
    await this.prisma.template.delete({
      where: { id },
    });
  }
}
