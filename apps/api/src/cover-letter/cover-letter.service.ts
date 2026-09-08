import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCoverLetterDto,
  UpdateCoverLetterDto,
} from './dto/cover-letter.dto';
import { paginate, paginationSkip } from '../common/paginate';
import { MAX_COVER_LETTERS_PER_USER } from './cover-letter.constants';
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
      const skip = paginationSkip(page, limit);
      return paginate(
        this.prisma,
        this.prisma.coverLetter.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy,
          include: { template: { select: { name: true, id: true } } },
        }),
        this.prisma.coverLetter.count({ where: { userId } }),
        page,
        limit,
      );
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
    return this.prisma.$transaction(async (tx) => {
      // Serializes concurrent creates for the same user so the trim below
      // can't race two inserts into briefly exceeding the cap — same
      // pattern as ResumeService.create's advisory lock.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

      const created = await tx.coverLetter.create({
        data: {
          userId,
          templateId: dto.templateId || null,
          jobTitle: dto.jobTitle ?? '',
          companyName: dto.companyName ?? '',
          jobDescription: dto.jobDescription ?? '',
          generatedText: dto.generatedText ?? '',
          model: dto.model ?? '',
          wordLimit: dto.wordLimit ?? null,
          characterLimit: dto.characterLimit ?? null,
          minimalChanges: dto.minimalChanges ?? null,
          sameLanguage: dto.sameLanguage ?? null,
          customPrompt: dto.customPrompt ?? null,
          jobMarket: dto.jobMarket ?? null,
        },
        include: { template: { select: { name: true, id: true } } },
      });

      // Rolling retention: keep only the MAX_COVER_LETTERS_PER_USER most
      // recent rows for this user, deleting anything older every time a
      // new one is created.
      const overflow = await tx.coverLetter.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: MAX_COVER_LETTERS_PER_USER,
        select: { id: true },
      });
      if (overflow.length > 0) {
        await tx.coverLetter.deleteMany({
          where: { id: { in: overflow.map((letter) => letter.id) } },
        });
      }

      return created;
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCoverLetterDto,
  ): Promise<db.CoverLetter> {
    // updateMany scopes by userId in the same query as the mutation itself,
    // so ownership is enforced atomically rather than by a separate check
    // beforehand (which a future refactor could otherwise decouple).
    const { count } = await this.prisma.coverLetter.updateMany({
      where: { id, userId },
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
        ...(dto.characterLimit !== undefined && {
          characterLimit: dto.characterLimit,
        }),
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
    });
    if (count === 0) {
      throw new NotFoundException(`Cover letter with ID ${id} not found`);
    }
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const { count } = await this.prisma.coverLetter.deleteMany({
      where: { id, userId },
    });
    if (count === 0) {
      throw new NotFoundException(`Cover letter with ID ${id} not found`);
    }
  }

  async removeBatch(ids: string[], userId: string): Promise<void> {
    await this.prisma.coverLetter.deleteMany({
      where: { id: { in: ids }, userId },
    });
  }
}
