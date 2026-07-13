import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoverLetterDto } from './dto/cover-letter.dto';
import * as db from '@career-covered/db';

@Injectable()
export class CoverLetterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<db.CoverLetter[]> {
    return this.prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<db.CoverLetter> {
    const letter = await this.prisma.coverLetter.findFirst({
      where: { id, userId },
    });
    if (!letter) {
      throw new NotFoundException(`Cover letter with ID ${id} not found`);
    }
    return letter;
  }

  async create(userId: string, dto: CreateCoverLetterDto): Promise<db.CoverLetter> {
    return this.prisma.coverLetter.create({
      data: {
        userId,
        templateId: dto.templateId || null,
        jobTitle: dto.jobTitle,
        companyName: dto.companyName,
        jobDescription: dto.jobDescription,
        generatedText: dto.generatedText,
        model: dto.model,
        wordLimit: dto.wordLimit || null,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // Verify existence and ownership
    await this.prisma.coverLetter.delete({
      where: { id },
    });
  }
}
