import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TemplateService', () => {
  let service: TemplateService;

  const mockPrismaService = {
    template: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue({ id: 't1' }),
      create: jest.fn().mockResolvedValue({ id: 't2' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest
      .fn()
      .mockImplementation((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    jest.clearAllMocks();
    mockPrismaService.template.findFirst.mockResolvedValue({ id: 't1' });
    mockPrismaService.template.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.template.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if template does not exist', async () => {
    mockPrismaService.template.findFirst.mockResolvedValueOnce(null);
    await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('update', () => {
    it('scopes the update by both id and userId in a single query', async () => {
      await service.update('t1', 'user-1', {
        name: 'New name',
        content: 'New content',
      });
      expect(mockPrismaService.template.updateMany).toHaveBeenCalledWith({
        where: { id: 't1', userId: 'user-1' },
        data: { name: 'New name', content: 'New content' },
      });
    });

    it('throws NotFoundException when the update matches no rows (not found or not owned)', async () => {
      mockPrismaService.template.updateMany.mockResolvedValueOnce({
        count: 0,
      });
      await expect(
        service.update('t1', 'user-1', {
          name: 'New name',
          content: 'New content',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('scopes the delete by both id and userId in a single query', async () => {
      await service.remove('t1', 'user-1');
      expect(mockPrismaService.template.deleteMany).toHaveBeenCalledWith({
        where: { id: 't1', userId: 'user-1' },
      });
    });

    it('throws NotFoundException when the delete matches no rows (not found or not owned)', async () => {
      mockPrismaService.template.deleteMany.mockResolvedValueOnce({
        count: 0,
      });
      await expect(service.remove('t1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
