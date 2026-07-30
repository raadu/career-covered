import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCoverLetterDto,
  UpdateCoverLetterDto,
} from './dto/cover-letter.dto';
import * as db from '@career-covered/db';

@Injectable()
export class CoverLetterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    page?: number,
    limit?: number,
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
    const orderBy = { createdAt: 'desc' as const };

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await this.prisma.$transaction([
        this.prisma.coverLetter.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy,
          include: { template: { select: { name: true, id: true } } },
        }),
        this.prisma.coverLetter.count({ where: { userId } }),
      ]);
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    return this.prisma.coverLetter.findMany({
      where: { userId },
      orderBy,
      include: { template: { select: { name: true, id: true } } },
    });
  }

  async findOne(id: string, userId: string): Promise<db.CoverLetter> {
    const letter = await this.prisma.coverLetter.findFirst({
      where: { id, userId },
      include: { template: { select: { name: true, id: true } } },
    });
    if (!letter) {
      throw new NotFoundException(`Cover letter with ID ${id} not found`);
    }
    return letter;
  }

  async create(
    userId: string,
    dto: CreateCoverLetterDto,
  ): Promise<db.CoverLetter> {
    return this.prisma.coverLetter.create({
      data: {
        userId,
        templateId: dto.templateId || null,
        jobTitle: dto.jobTitle ?? '',
        companyName: dto.companyName ?? '',
        jobDescription: dto.jobDescription ?? '',
        generatedText: dto.generatedText ?? '',
        model: dto.model ?? '',
        wordLimit: dto.wordLimit ?? null,
        minimalChanges: dto.minimalChanges ?? null,
        sameLanguage: dto.sameLanguage ?? null,
        customPrompt: dto.customPrompt ?? null,
        jobMarket: dto.jobMarket ?? null,
      },
      include: { template: { select: { name: true, id: true } } },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCoverLetterDto,
  ): Promise<db.CoverLetter> {
    await this.findOne(id, userId);
    return this.prisma.coverLetter.update({
      where: { id },
      data: {
        ...(dto.jobTitle !== undefined && { jobTitle: dto.jobTitle }),
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.jobDescription !== undefined && {
          jobDescription: dto.jobDescription,
        }),
        ...(dto.generatedText !== undefined && {
          generatedText: dto.generatedText,
        }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.wordLimit !== undefined && { wordLimit: dto.wordLimit }),
        ...(dto.minimalChanges !== undefined && {
          minimalChanges: dto.minimalChanges,
        }),
        ...(dto.sameLanguage !== undefined && {
          sameLanguage: dto.sameLanguage,
        }),
        ...(dto.customPrompt !== undefined && {
          customPrompt: dto.customPrompt,
        }),
        ...(dto.jobMarket !== undefined && { jobMarket: dto.jobMarket }),
      },
      include: { template: { select: { name: true, id: true } } },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.prisma.coverLetter.delete({
      where: { id },
    });
  }

  async removeBatch(ids: string[], userId: string): Promise<void> {
    await this.prisma.coverLetter.deleteMany({
      where: { id: { in: ids }, userId },
    });
  }
}
