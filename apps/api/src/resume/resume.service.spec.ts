import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'stream';
import { ResumeService } from './resume.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MAX_RESUME_BYTES } from './resume.constants';

// Not a real, parseable PDF — passes the magic-byte check (starts with
// "%PDF-") but makes pdf-lib/unpdf fail to parse it, which deliberately
// exercises the compress()/extractResumeText() fallback paths (falls back
// to the original bytes, parsedText stays null) rather than depending on
// an embedded real PDF fixture for these unit tests.
const fakePdfBuffer = (size = 32) =>
  Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(size, 'x')]);

const fakeFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: fakePdfBuffer(),
    size: fakePdfBuffer().length,
    ...overrides,
  }) as Express.Multer.File;

describe('ResumeService', () => {
  let service: ResumeService;

  const mockPrismaService = {
    resume: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
  };

  const mockStorageService = {
    putObject: jest.fn(),
    getObject: jest.fn(),
    deleteObject: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPrismaService.$executeRaw.mockResolvedValue(undefined);
    mockPrismaService.$transaction.mockImplementation((arg: unknown) => {
      if (Array.isArray(arg)) return Promise.all(arg);
      return (arg as (tx: typeof mockPrismaService) => unknown)(
        mockPrismaService,
      );
    });
    mockStorageService.putObject.mockResolvedValue(undefined);
    mockStorageService.deleteObject.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
  });

  describe('create', () => {
    it('rejects a file that is not actually a PDF', async () => {
      await expect(
        service.create(
          'user-1',
          fakeFile({ buffer: Buffer.from('not a pdf') }),
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockStorageService.putObject).not.toHaveBeenCalled();
    });

    it('rejects when the user is already at the cap (fast, non-authoritative check)', async () => {
      mockPrismaService.resume.count.mockResolvedValue(8);
      await expect(
        service.create('user-1', fakeFile(), undefined),
      ).rejects.toThrow(ConflictException);
      expect(mockStorageService.putObject).not.toHaveBeenCalled();
    });

    it('rejects a file over the size limit', async () => {
      mockPrismaService.resume.count.mockResolvedValue(0);
      const bigFile = fakeFile({ buffer: fakePdfBuffer(MAX_RESUME_BYTES + 1) });
      await expect(
        service.create('user-1', bigFile, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('uploads, extracts, and creates the row, defaulting name to the filename without extension', async () => {
      mockPrismaService.resume.count.mockResolvedValue(2);
      mockPrismaService.resume.findMany.mockResolvedValue([
        { order: 0 },
        { order: 1 },
      ]);
      mockPrismaService.resume.create.mockResolvedValue({
        id: 'r1',
        userId: 'user-1',
        name: 'resume',
        originalFileName: 'resume.pdf',
        storageKey: 'resumes/user-1/x.pdf',
        mimeType: 'application/pdf',
        fileSize: 41,
        parsedText: null,
        order: 2,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await service.create('user-1', fakeFile(), undefined);

      expect(mockStorageService.putObject).toHaveBeenCalledWith(
        expect.stringMatching(/^resumes\/user-1\/.+\.pdf$/),
        expect.any(Buffer),
        'application/pdf',
      );
      expect(mockPrismaService.resume.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          name: 'resume',
          order: 2,
          parsedText: null,
        }),
      });
      expect(result).toMatchObject({ id: 'r1', name: 'resume' });
    });

    it('uses the first resume slot (order 0) when the user has none yet', async () => {
      mockPrismaService.resume.count.mockResolvedValue(0);
      mockPrismaService.resume.findMany.mockResolvedValue([]);
      mockPrismaService.resume.create.mockResolvedValue({
        id: 'r1',
        order: 0,
        name: 'resume',
        originalFileName: 'resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 41,
        parsedText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create('user-1', fakeFile(), undefined);

      expect(mockPrismaService.resume.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ order: 0 }),
      });
    });

    it('uses the provided name, trimmed, when given', async () => {
      mockPrismaService.resume.count.mockResolvedValue(0);
      mockPrismaService.resume.findMany.mockResolvedValue([]);
      mockPrismaService.resume.create.mockResolvedValue({
        id: 'r1',
        order: 0,
        name: 'My Resume',
        originalFileName: 'resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 41,
        parsedText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create('user-1', fakeFile(), '  My Resume  ');

      expect(mockPrismaService.resume.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'My Resume' }),
      });
    });

    it('rejects when the authoritative in-transaction check finds the cap already reached', async () => {
      mockPrismaService.resume.count.mockResolvedValue(0); // passes the early check
      mockPrismaService.resume.findMany.mockResolvedValue(
        Array.from({ length: 8 }, (_, i) => ({ order: i })),
      );

      await expect(
        service.create('user-1', fakeFile(), undefined),
      ).rejects.toThrow(ConflictException);
    });

    it('cleans up the uploaded object (best-effort) when the DB write fails', async () => {
      mockPrismaService.resume.count.mockResolvedValue(0);
      mockPrismaService.resume.findMany.mockResolvedValue([]);
      mockPrismaService.resume.create.mockRejectedValue(new Error('db down'));

      await expect(
        service.create('user-1', fakeFile(), undefined),
      ).rejects.toThrow('db down');
      expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
        expect.stringMatching(/^resumes\/user-1\/.+\.pdf$/),
      );
    });

    it('propagates a storage upload failure without attempting the DB write', async () => {
      mockPrismaService.resume.count.mockResolvedValue(0);
      mockStorageService.putObject.mockRejectedValue(new Error('s3 down'));

      await expect(
        service.create('user-1', fakeFile(), undefined),
      ).rejects.toThrow('s3 down');
      expect(mockPrismaService.resume.create).not.toHaveBeenCalled();
    });
  });

  describe('replace', () => {
    it('throws NotFoundException when the resume is not owned/missing', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue(null);
      await expect(service.replace('r1', 'user-1', fakeFile())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('preserves name and order, updates file fields, and deletes the old object', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue({
        id: 'r1',
        userId: 'user-1',
        name: 'Old Name',
        order: 3,
        storageKey: 'resumes/user-1/old.pdf',
      });
      mockPrismaService.resume.update.mockResolvedValue({
        id: 'r1',
        name: 'Old Name',
        order: 3,
        originalFileName: 'new.pdf',
        mimeType: 'application/pdf',
        fileSize: 41,
        parsedText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.replace(
        'r1',
        'user-1',
        fakeFile({ originalname: 'new.pdf' }),
      );

      expect(mockPrismaService.resume.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: expect.objectContaining({ originalFileName: 'new.pdf' }),
      });
      expect(
        mockPrismaService.resume.update.mock.calls[0][0].data,
      ).not.toHaveProperty('name');
      expect(
        mockPrismaService.resume.update.mock.calls[0][0].data,
      ).not.toHaveProperty('order');
      expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
        'resumes/user-1/old.pdf',
      );
      expect(result.name).toBe('Old Name');
    });

    it('does not fail the request when deleting the old object fails', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue({
        id: 'r1',
        userId: 'user-1',
        name: 'Old Name',
        order: 3,
        storageKey: 'resumes/user-1/old.pdf',
      });
      mockPrismaService.resume.update.mockResolvedValue({
        id: 'r1',
        name: 'Old Name',
        order: 3,
        originalFileName: 'new.pdf',
        mimeType: 'application/pdf',
        fileSize: 41,
        parsedText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockStorageService.deleteObject.mockRejectedValue(new Error('boom'));

      await expect(
        service.replace('r1', 'user-1', fakeFile()),
      ).resolves.toMatchObject({ id: 'r1' });
    });
  });

  describe('rename', () => {
    it('throws NotFoundException when nothing matched', async () => {
      mockPrismaService.resume.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.rename('r1', 'user-1', 'New Name')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates the name and returns the fresh row', async () => {
      mockPrismaService.resume.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.resume.findFirst.mockResolvedValue({
        id: 'r1',
        name: 'New Name',
        order: 0,
        originalFileName: 'resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 41,
        parsedText: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.rename('r1', 'user-1', 'New Name');
      expect(mockPrismaService.resume.updateMany).toHaveBeenCalledWith({
        where: { id: 'r1', userId: 'user-1' },
        data: { name: 'New Name' },
      });
      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when not owned/missing', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue(null);
      await expect(service.remove('r1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes the row and the storage object', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue({
        id: 'r1',
        storageKey: 'resumes/user-1/x.pdf',
      });

      await service.remove('r1', 'user-1');

      expect(mockPrismaService.resume.delete).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
      expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
        'resumes/user-1/x.pdf',
      );
    });

    it('still succeeds (204-worthy) when storage cleanup fails', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue({
        id: 'r1',
        storageKey: 'resumes/user-1/x.pdf',
      });
      mockStorageService.deleteObject.mockRejectedValue(new Error('boom'));

      await expect(service.remove('r1', 'user-1')).resolves.toBeUndefined();
    });
  });

  describe('removeBatch', () => {
    it('deletes only the rows matching the ids and owned by the user, then their storage objects', async () => {
      const matched = [
        { id: 'a', storageKey: 'resumes/user-1/a.pdf' },
        { id: 'b', storageKey: 'resumes/user-1/b.pdf' },
      ];
      mockPrismaService.resume.findMany.mockResolvedValue(matched);

      await service.removeBatch(['a', 'b', 'foreign-id'], 'user-1');

      expect(mockPrismaService.resume.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['a', 'b', 'foreign-id'] }, userId: 'user-1' },
      });
      expect(mockPrismaService.resume.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['a', 'b', 'foreign-id'] }, userId: 'user-1' },
      });
      expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
        'resumes/user-1/a.pdf',
      );
      expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
        'resumes/user-1/b.pdf',
      );
    });

    it('does not throw when a storage object fails to delete', async () => {
      mockPrismaService.resume.findMany.mockResolvedValue([
        { id: 'a', storageKey: 'resumes/user-1/a.pdf' },
      ]);
      mockStorageService.deleteObject.mockRejectedValue(new Error('boom'));

      await expect(
        service.removeBatch(['a'], 'user-1'),
      ).resolves.toBeUndefined();
    });

    it('deletes no storage objects when none of the ids belong to the user', async () => {
      mockPrismaService.resume.findMany.mockResolvedValue([]);

      await service.removeBatch(['not-mine'], 'user-1');

      expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    const current = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    it('rejects a list that is too short', async () => {
      mockPrismaService.resume.findMany.mockResolvedValue(current);
      await expect(service.reorder('user-1', ['a', 'b'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a list containing an id the user does not own', async () => {
      mockPrismaService.resume.findMany.mockResolvedValue(current);
      await expect(
        service.reorder('user-1', ['a', 'b', 'foreign-id']),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a list with a duplicate id', async () => {
      mockPrismaService.resume.findMany.mockResolvedValue(current);
      await expect(service.reorder('user-1', ['a', 'a', 'c'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('updates every row order to its array index, scoped by userId, then returns the fresh list', async () => {
      mockPrismaService.resume.findMany
        .mockResolvedValueOnce(current) // ownership check
        .mockResolvedValueOnce([]); // findAll() re-fetch at the end
      mockPrismaService.resume.updateMany.mockResolvedValue({ count: 1 });

      await service.reorder('user-1', ['c', 'a', 'b']);

      expect(mockPrismaService.resume.updateMany).toHaveBeenCalledWith({
        where: { id: 'c', userId: 'user-1' },
        data: { order: 0 },
      });
      expect(mockPrismaService.resume.updateMany).toHaveBeenCalledWith({
        where: { id: 'a', userId: 'user-1' },
        data: { order: 1 },
      });
      expect(mockPrismaService.resume.updateMany).toHaveBeenCalledWith({
        where: { id: 'b', userId: 'user-1' },
        data: { order: 2 },
      });
    });
  });

  describe('getFileStream', () => {
    it('throws NotFoundException when the resume is not owned/missing', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue(null);
      await expect(service.getFileStream('r1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the stream alongside the resume row', async () => {
      const resume = { id: 'r1', storageKey: 'resumes/user-1/x.pdf' };
      mockPrismaService.resume.findFirst.mockResolvedValue(resume);
      const stream = Readable.from(['pdf bytes']);
      mockStorageService.getObject.mockResolvedValue({
        stream,
        contentType: 'application/pdf',
        contentLength: 9,
      });

      const result = await service.getFileStream('r1', 'user-1');
      expect(result.stream).toBe(stream);
      expect(result.resume).toBe(resume);
    });

    it('self-heals by deleting the row when the storage object is missing', async () => {
      const resume = { id: 'r1', storageKey: 'resumes/user-1/gone.pdf' };
      mockPrismaService.resume.findFirst.mockResolvedValue(resume);
      mockStorageService.getObject.mockRejectedValue(
        new NotFoundException('File not found in storage'),
      );
      mockPrismaService.resume.delete.mockResolvedValue(resume);

      await expect(service.getFileStream('r1', 'user-1')).rejects.toThrow(
        'needs to be re-uploaded',
      );
      expect(mockPrismaService.resume.delete).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
    });
  });

  describe('getContent', () => {
    it('throws NotFoundException when the resume is not owned/missing', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue(null);
      await expect(service.getContent('r1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the parsed text for an owned resume', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue({
        parsedText: 'Extracted resume text',
      });

      await expect(service.getContent('r1', 'user-1')).resolves.toEqual({
        parsedText: 'Extracted resume text',
      });
      expect(mockPrismaService.resume.findFirst).toHaveBeenCalledWith({
        where: { id: 'r1', userId: 'user-1' },
        select: { parsedText: true },
      });
    });

    it('returns null parsedText when extraction previously failed', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValue({
        parsedText: null,
      });

      await expect(service.getContent('r1', 'user-1')).resolves.toEqual({
        parsedText: null,
      });
    });
  });
});
