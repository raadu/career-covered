import { Test, TestingModule } from '@nestjs/testing';
import { CoverLetterService } from './cover-letter.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CoverLetterService', () => {
  let service: CoverLetterService;

  const mockPrismaService = {
    coverLetter: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue({ id: 'cl-1' }),
      create: jest.fn().mockResolvedValue({ id: 'cl-2' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(0),
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
    jest.clearAllMocks();
    mockPrismaService.coverLetter.findFirst.mockResolvedValue({ id: 'cl-1' });
    mockPrismaService.coverLetter.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.coverLetter.deleteMany.mockResolvedValue({ count: 1 });
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

  describe('update', () => {
    it('scopes the update by both id and userId in a single query', async () => {
      await service.update('cl-1', 'user-1', { jobTitle: 'Engineer' });
      expect(mockPrismaService.coverLetter.updateMany).toHaveBeenCalledWith({
        where: { id: 'cl-1', userId: 'user-1' },
        data: { jobTitle: 'Engineer' },
      });
    });

    it('throws NotFoundException when the update matches no rows (not found or not owned)', async () => {
      mockPrismaService.coverLetter.updateMany.mockResolvedValueOnce({
        count: 0,
      });
      await expect(
        service.update('cl-1', 'user-1', { jobTitle: 'Engineer' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('scopes the delete by both id and userId in a single query', async () => {
      await service.remove('cl-1', 'user-1');
      expect(mockPrismaService.coverLetter.deleteMany).toHaveBeenCalledWith({
        where: { id: 'cl-1', userId: 'user-1' },
      });
    });

    it('throws NotFoundException when the delete matches no rows (not found or not owned)', async () => {
      mockPrismaService.coverLetter.deleteMany.mockResolvedValueOnce({
        count: 0,
      });
      await expect(service.remove('cl-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
