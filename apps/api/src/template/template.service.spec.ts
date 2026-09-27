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

  describe('findAll', () => {
    it('returns an unpaginated list scoped by userId, newest-created first, when no page/limit is given', async () => {
      mockPrismaService.template.findMany.mockResolvedValueOnce([{ id: 't1' }]);
      const result = await service.findAll('user-1');

      expect(mockPrismaService.template.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: 't1' }]);
    });

    it('orders by updatedAt instead of createdAt when sortByUpdateTime is set', async () => {
      await service.findAll('user-1', undefined, undefined, true);
      expect(mockPrismaService.template.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('returns a paginated envelope with skip/take derived from page and limit', async () => {
      mockPrismaService.template.findMany.mockResolvedValueOnce([{ id: 't3' }]);
      mockPrismaService.template.count.mockResolvedValueOnce(21);

      const result = await service.findAll('user-1', 3, 10);

      expect(mockPrismaService.template.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 20,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.template.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual({
        data: [{ id: 't3' }],
        total: 21,
        page: 3,
        limit: 10,
        totalPages: 3,
      });
    });

    it('reports zero totalPages for a user with no templates', async () => {
      mockPrismaService.template.findMany.mockResolvedValueOnce([]);
      mockPrismaService.template.count.mockResolvedValueOnce(0);

      const result = await service.findAll('user-1', 1, 10);
      expect(result).toMatchObject({ data: [], total: 0, totalPages: 0 });
    });

    it.each([
      ['page without limit', 2, undefined],
      ['limit without page', undefined, 10],
    ])(
      'falls back to the unpaginated list when given %s',
      async (_label, page, limit) => {
        await service.findAll('user-1', page, limit);
        expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
        expect(mockPrismaService.template.findMany).toHaveBeenCalledWith({
          where: { userId: 'user-1' },
          orderBy: { createdAt: 'desc' },
        });
      },
    );
  });

  describe('create', () => {
    it('creates the template owned by the given user with only name and content', async () => {
      const result = await service.create('user-1', {
        name: 'My template',
        content: 'Dear hiring manager',
      });

      expect(mockPrismaService.template.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'My template',
          content: 'Dear hiring manager',
        },
      });
      expect(result).toEqual({ id: 't2' });
    });
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
      expect(mockPrismaService.template.findFirst).not.toHaveBeenCalled();
    });

    it('returns the freshly re-read template, scoped by the same user', async () => {
      mockPrismaService.template.findFirst.mockResolvedValueOnce({
        id: 't1',
        name: 'New name',
      });
      const result = await service.update('t1', 'user-1', {
        name: 'New name',
        content: 'New content',
      });

      expect(mockPrismaService.template.findFirst).toHaveBeenCalledWith({
        where: { id: 't1', userId: 'user-1' },
      });
      expect(result).toEqual({ id: 't1', name: 'New name' });
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
