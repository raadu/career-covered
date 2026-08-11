import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import * as db from '@career-covered/db';

describe('ResumeController', () => {
  let controller: ResumeController;
  let service: ResumeService;

  const mockUser = { id: 'user-1', email: 'test@example.com' } as db.User;

  const fakeFile = {
    fieldname: 'file',
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n'),
    size: 9,
  } as Express.Multer.File;

  const mockResumeService = {
    findAll: jest.fn(),
    create: jest.fn(),
    replace: jest.fn(),
    rename: jest.fn(),
    remove: jest.fn(),
    removeBatch: jest.fn(),
    reorder: jest.fn(),
    getFileStream: jest.fn(),
    getContent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [{ provide: ResumeService, useValue: mockResumeService }],
    }).compile();

    controller = module.get<ResumeController>(ResumeController);
    service = module.get<ResumeService>(ResumeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to the service with the current user id', async () => {
    mockResumeService.findAll.mockResolvedValue([]);
    await controller.findAll(mockUser);
    expect(service.findAll).toHaveBeenCalledWith('user-1');
  });

  describe('create', () => {
    it('rejects when no file is present', async () => {
      await expect(
        controller.create(undefined as never, undefined, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('delegates to the service with the file, name, and user id', async () => {
      mockResumeService.create.mockResolvedValue({ id: 'r1' });
      await controller.create(fakeFile, 'My Resume', mockUser);
      expect(service.create).toHaveBeenCalledWith(
        'user-1',
        fakeFile,
        'My Resume',
      );
    });
  });

  describe('replace', () => {
    it('rejects when no file is present', async () => {
      await expect(
        controller.replace('r1', undefined as never, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(service.replace).not.toHaveBeenCalled();
    });

    it('delegates to the service', async () => {
      mockResumeService.replace.mockResolvedValue({ id: 'r1' });
      await controller.replace('r1', fakeFile, mockUser);
      expect(service.replace).toHaveBeenCalledWith('r1', 'user-1', fakeFile);
    });
  });

  it('reorder delegates to the service with the ids and user id', async () => {
    mockResumeService.reorder.mockResolvedValue([]);
    await controller.reorder({ ids: ['a', 'b'] }, mockUser);
    expect(service.reorder).toHaveBeenCalledWith('user-1', ['a', 'b']);
  });

  it('rename delegates to the service', async () => {
    mockResumeService.rename.mockResolvedValue({ id: 'r1' });
    await controller.rename('r1', { name: 'New Name' }, mockUser);
    expect(service.rename).toHaveBeenCalledWith('r1', 'user-1', 'New Name');
  });

  it('getContent delegates to the service with the id and user id', async () => {
    mockResumeService.getContent.mockResolvedValue({ parsedText: 'text' });
    await controller.getContent('r1', mockUser);
    expect(service.getContent).toHaveBeenCalledWith('r1', 'user-1');
  });

  it('remove delegates to the service', async () => {
    await controller.remove('r1', mockUser);
    expect(service.remove).toHaveBeenCalledWith('r1', 'user-1');
  });

  it('removeBatch delegates to the service with the ids and user id', async () => {
    await controller.removeBatch({ ids: ['a', 'b'] }, mockUser);
    expect(service.removeBatch).toHaveBeenCalledWith(['a', 'b'], 'user-1');
  });

  describe('streaming (preview / download)', () => {
    const buildMockRes = () => ({
      set: jest.fn(),
      destroy: jest.fn(),
    });

    it('preview sets an inline Content-Disposition, framing headers, and pipes the stream', async () => {
      const stream = Readable.from(['pdf bytes']);
      const pipeSpy = jest
        .spyOn(stream, 'pipe')
        .mockReturnValue(stream as never);
      mockResumeService.getFileStream.mockResolvedValue({
        stream,
        contentType: 'application/pdf',
        contentLength: 9,
        resume: { originalFileName: 'resume.pdf' },
      });
      const res = buildMockRes();

      await controller.preview('r1', mockUser, res as never);

      expect(service.getFileStream).toHaveBeenCalledWith('r1', 'user-1');
      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="resume.pdf"',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': "frame-ancestors 'self'",
        }),
      );
      expect(pipeSpy).toHaveBeenCalledWith(res);
    });

    it('download sets an attachment Content-Disposition', async () => {
      const stream = Readable.from(['pdf bytes']);
      jest.spyOn(stream, 'pipe').mockReturnValue(stream as never);
      mockResumeService.getFileStream.mockResolvedValue({
        stream,
        contentType: 'application/pdf',
        contentLength: 9,
        resume: { originalFileName: 'resume.pdf' },
      });
      const res = buildMockRes();

      await controller.download('r1', mockUser, res as never);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': 'attachment; filename="resume.pdf"',
        }),
      );
    });

    it('destroys the response if the stream errors mid-flight', async () => {
      const stream = Readable.from(['pdf bytes']);
      jest.spyOn(stream, 'pipe').mockReturnValue(stream as never);
      mockResumeService.getFileStream.mockResolvedValue({
        stream,
        resume: { originalFileName: 'resume.pdf' },
      });
      const res = buildMockRes();

      await controller.preview('r1', mockUser, res as never);
      stream.emit('error', new Error('boom'));

      expect(res.destroy).toHaveBeenCalled();
    });
  });
});
