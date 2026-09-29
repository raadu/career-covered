import { Test, TestingModule } from '@nestjs/testing';
import { CoverLetterController } from './cover-letter.controller';
import { CoverLetterService } from './cover-letter.service';
import { User } from '@career-covered/db';

describe('CoverLetterController', () => {
  let controller: CoverLetterController;
  let service: CoverLetterService;

  const mockUser = { id: 'user-123', email: 'test@example.com' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoverLetterController],
      providers: [
        {
          provide: CoverLetterService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 'cl-1' }),
            create: jest.fn().mockResolvedValue({ id: 'cl-2' }),
            update: jest.fn().mockResolvedValue({ id: 'cl-1' }),
            remove: jest.fn().mockResolvedValue(undefined),
            removeBatch: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CoverLetterController>(CoverLetterController);
    service = module.get<CoverLetterService>(CoverLetterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list all cover letters', async () => {
    const result = await controller.findAll(mockUser);
    expect(service.findAll).toHaveBeenCalledWith(
      mockUser.id,
      undefined,
      undefined,
    );
    expect(result).toEqual([]);
  });

  it('findOne delegates to the service with the authenticated user id, never a body/query-supplied one', async () => {
    const result = await controller.findOne('cl-1', mockUser);
    expect(service.findOne).toHaveBeenCalledWith('cl-1', mockUser.id);
    expect(result).toEqual({ id: 'cl-1' });
  });

  it('create delegates to the service scoped to the authenticated user id', async () => {
    const dto = { jobDescription: 'JD', generatedText: 'Letter text' };
    const result = await controller.create(dto, mockUser);
    expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    expect(result).toEqual({ id: 'cl-2' });
  });

  it('update delegates to the service scoped to the authenticated user id', async () => {
    const dto = { jobTitle: 'Engineer' };
    const result = await controller.update('cl-1', dto, mockUser);
    expect(service.update).toHaveBeenCalledWith('cl-1', mockUser.id, dto);
    expect(result).toEqual({ id: 'cl-1' });
  });

  it('remove delegates to the service scoped to the authenticated user id', async () => {
    await controller.remove('cl-1', mockUser);
    expect(service.remove).toHaveBeenCalledWith('cl-1', mockUser.id);
  });

  it('removeBatch delegates to the service scoped to the authenticated user id, never a client-supplied one', async () => {
    await controller.removeBatch({ ids: ['cl-1', 'cl-2'] }, mockUser);
    expect(service.removeBatch).toHaveBeenCalledWith(
      ['cl-1', 'cl-2'],
      mockUser.id,
    );
  });
});
