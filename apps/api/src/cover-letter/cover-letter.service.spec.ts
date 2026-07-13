import { Test, TestingModule } from '@nestjs/testing';
import { CoverLetterService } from './cover-letter.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CoverLetterService', () => {
  let service: CoverLetterService;
  let prisma: PrismaService;

  const mockPrismaService = {
    coverLetter: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue({ id: 'cl-1' }),
      create: jest.fn().mockResolvedValue({ id: 'cl-2' }),
      delete: jest.fn().mockResolvedValue(undefined),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoverLetterService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoverLetterService>(CoverLetterService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if cover letter not found', async () => {
    mockPrismaService.coverLetter.findFirst.mockResolvedValueOnce(null);
    await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
