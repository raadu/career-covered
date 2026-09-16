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

  describe('findOne', () => {
    it('scopes the lookup by both id and userId, so another user cannot read it by id alone', async () => {
      await service.findOne('t1', 'user-1');
      expect(mockPrismaService.template.findFirst).toHaveBeenCalledWith({
        where: { id: 't1', userId: 'user-1' },
      });
    });

    it('throws NotFoundException when the template exists but belongs to a different user', async () => {
      // findFirst is scoped by userId at the query level, so a template
      // owned by someone else comes back as null, identical to a missing id.
      mockPrismaService.template.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.findOne('someone-elses-template', 'attacker-1'),
      ).rejects.toThrow(NotFoundException);
    });
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

  describe('removeBatch', () => {
    it('scopes the batch delete by userId, alongside the id list', async () => {
      await service.removeBatch(['t1', 't2'], 'user-1');
      expect(mockPrismaService.template.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['t1', 't2'] }, userId: 'user-1' },
      });
    });

    it('does not throw when some ids belong to another user — they are simply excluded by the userId scope', async () => {
      // deleteMany with a userId filter silently deletes 0 rows for ids it
      // doesn't own, rather than 404ing — unlike single remove(), a batch
      // request mixing owned and unowned ids should not fail the whole call.
      mockPrismaService.template.deleteMany.mockResolvedValueOnce({
        count: 1,
      });
      await expect(
        service.removeBatch(['t1', 'someone-elses-template'], 'user-1'),
      ).resolves.toBeUndefined();
    });
  });
});
