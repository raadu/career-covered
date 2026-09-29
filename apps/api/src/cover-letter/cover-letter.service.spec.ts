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
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
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
    mockPrismaService.coverLetter.findMany.mockResolvedValue([]);
    mockPrismaService.coverLetter.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.coverLetter.deleteMany.mockResolvedValue({ count: 1 });
    mockPrismaService.$executeRaw.mockResolvedValue(undefined);
    mockPrismaService.$transaction.mockImplementation((arg: unknown) => {
      // paginate() passes an array of queries; create() passes a callback
      // receiving a tx client — the mock client is the same object, so
      // callers can assert against it directly.
      if (Array.isArray(arg)) return Promise.all(arg);
      return (arg as (tx: typeof mockPrismaService) => unknown)(
        mockPrismaService,
      );
    });
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

  describe('findAll', () => {
    const includeTemplate = {
      template: { select: { name: true, id: true } },
    };

    it('returns an unpaginated list scoped by userId, newest first, with the template name', async () => {
      mockPrismaService.coverLetter.findMany.mockResolvedValueOnce([
        { id: 'cl-1' },
      ]);
      const result = await service.findAll('user-1');

      expect(mockPrismaService.coverLetter.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        include: includeTemplate,
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: 'cl-1' }]);
    });

    it('returns a paginated envelope with skip/take derived from page and limit', async () => {
      mockPrismaService.coverLetter.findMany.mockResolvedValueOnce([
        { id: 'cl-6' },
      ]);
      mockPrismaService.coverLetter.count.mockResolvedValueOnce(11);

      const result = await service.findAll('user-1', 2, 5);

      expect(mockPrismaService.coverLetter.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: includeTemplate,
      });
      expect(mockPrismaService.coverLetter.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual({
        data: [{ id: 'cl-6' }],
        total: 11,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });

    it('returns an empty page, not an error, when the page is past the last one', async () => {
      mockPrismaService.coverLetter.findMany.mockResolvedValueOnce([]);
      mockPrismaService.coverLetter.count.mockResolvedValueOnce(3);

      const result = await service.findAll('user-1', 99, 10);
      expect(result).toMatchObject({ data: [], total: 3, totalPages: 1 });
    });

    it.each([
      ['page without limit', 2, undefined],
      ['limit without page', undefined, 10],
    ])(
      'falls back to the unpaginated list when given %s',
      async (_label, page, limit) => {
        await service.findAll('user-1', page, limit);
        expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      },
    );
  });

  describe('findOne', () => {
    it('scopes the lookup by both id and userId, so another user cannot read it by id alone', async () => {
      await service.findOne('cl-1', 'user-1');
      expect(mockPrismaService.coverLetter.findFirst).toHaveBeenCalledWith({
        where: { id: 'cl-1', userId: 'user-1' },
        include: { template: { select: { name: true, id: true } } },
      });
    });

    it('throws NotFoundException when the letter exists but belongs to a different user', async () => {
      mockPrismaService.coverLetter.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.findOne('someone-elses-letter', 'attacker-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates the cover letter for the given user', async () => {
      mockPrismaService.coverLetter.create.mockResolvedValue({ id: 'cl-2' });
      const result = await service.create('user-1', {
        jobDescription: 'JD',
        generatedText: 'Letter text',
      });

      expect(mockPrismaService.coverLetter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
      expect(result).toEqual({ id: 'cl-2' });
    });

    it('passes characterLimit through to the create call', async () => {
      await service.create('user-1', {
        jobDescription: 'JD',
        generatedText: 'Letter text',
        characterLimit: 2000,
      });

      expect(mockPrismaService.coverLetter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ characterLimit: 2000 }),
        }),
      );
    });

    it('takes the per-user advisory lock before inserting', async () => {
      await service.create('user-1', {
        jobDescription: 'JD',
        generatedText: 'Letter text',
      });

      expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(1);
      const lockOrder =
        mockPrismaService.$executeRaw.mock.invocationCallOrder[0];
      const createOrder =
        mockPrismaService.coverLetter.create.mock.invocationCallOrder[0];
      expect(lockOrder).toBeLessThan(createOrder);
    });

    it('fills omitted optional fields with empty-string / null defaults', async () => {
      await service.create('user-1', {});

      expect(mockPrismaService.coverLetter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: 'user-1',
            templateId: null,
            jobTitle: '',
            companyName: '',
            jobDescription: '',
            generatedText: '',
            model: '',
            wordLimit: null,
            characterLimit: null,
            minimalChanges: null,
            sameLanguage: null,
            customPrompt: null,
            jobMarket: null,
          },
        }),
      );
    });

    it('stores an empty-string templateId as null rather than a dangling FK', async () => {
      await service.create('user-1', { templateId: '' });

      expect(mockPrismaService.coverLetter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ templateId: null }),
        }),
      );
    });

    it('keeps explicit falsy settings (false toggles) instead of nulling them', async () => {
      await service.create('user-1', {
        minimalChanges: false,
        sameLanguage: false,
      });

      expect(mockPrismaService.coverLetter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            minimalChanges: false,
            sameLanguage: false,
          }),
        }),
      );
    });

    it('propagates a failed insert without running the retention trim', async () => {
      mockPrismaService.coverLetter.create.mockRejectedValueOnce(
        new Error('FK violation'),
      );

      await expect(
        service.create('user-1', { templateId: 'missing-template' }),
      ).rejects.toThrow('FK violation');
      expect(mockPrismaService.coverLetter.findMany).not.toHaveBeenCalled();
      expect(mockPrismaService.coverLetter.deleteMany).not.toHaveBeenCalled();
    });

    it('does not trim anything when the user is under the cap', async () => {
      mockPrismaService.coverLetter.findMany.mockResolvedValue([]);
      await service.create('user-1', {
        jobDescription: 'JD',
        generatedText: 'Letter text',
      });

      expect(mockPrismaService.coverLetter.deleteMany).not.toHaveBeenCalled();
    });

    it('deletes rows beyond the 100 most recent for that user', async () => {
      mockPrismaService.coverLetter.findMany.mockResolvedValue([
        { id: 'old-1' },
        { id: 'old-2' },
      ]);

      await service.create('user-1', {
        jobDescription: 'JD',
        generatedText: 'Letter text',
      });

      expect(mockPrismaService.coverLetter.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: 100,
        select: { id: true },
      });
      expect(mockPrismaService.coverLetter.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['old-1', 'old-2'] } },
      });
    });
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
      expect(mockPrismaService.coverLetter.findFirst).not.toHaveBeenCalled();
    });

    it('only writes the fields present in the DTO, leaving the rest untouched', async () => {
      await service.update('cl-1', 'user-1', {
        generatedText: 'Edited letter',
        jobMarket: 'US',
      });

      expect(mockPrismaService.coverLetter.updateMany).toHaveBeenCalledWith({
        where: { id: 'cl-1', userId: 'user-1' },
        data: { generatedText: 'Edited letter', jobMarket: 'US' },
      });
    });

    it('writes explicit falsy values (0, false, empty string) rather than skipping them', async () => {
      await service.update('cl-1', 'user-1', {
        jobTitle: '',
        wordLimit: 0,
        minimalChanges: false,
        sameLanguage: false,
      });

      expect(mockPrismaService.coverLetter.updateMany).toHaveBeenCalledWith({
        where: { id: 'cl-1', userId: 'user-1' },
        data: {
          jobTitle: '',
          wordLimit: 0,
          minimalChanges: false,
          sameLanguage: false,
        },
      });
    });

    it('sends an empty data object for an empty DTO and still returns the letter', async () => {
      const result = await service.update('cl-1', 'user-1', {});

      expect(mockPrismaService.coverLetter.updateMany).toHaveBeenCalledWith({
        where: { id: 'cl-1', userId: 'user-1' },
        data: {},
      });
      expect(result).toEqual({ id: 'cl-1' });
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

  describe('removeBatch', () => {
    it('scopes the batch delete by userId, alongside the id list', async () => {
      await service.removeBatch(['cl-1', 'cl-2'], 'user-1');
      expect(mockPrismaService.coverLetter.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['cl-1', 'cl-2'] }, userId: 'user-1' },
      });
    });

    it('does not throw when some ids belong to another user — they are simply excluded by the userId scope', async () => {
      mockPrismaService.coverLetter.deleteMany.mockResolvedValueOnce({
        count: 1,
      });
      await expect(
        service.removeBatch(['cl-1', 'someone-elses-letter'], 'user-1'),
      ).resolves.toBeUndefined();
    });
  });
});
