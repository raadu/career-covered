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
            remove: jest.fn().mockResolvedValue(undefined),
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
    expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual([]);
  });
});
