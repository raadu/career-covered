import { Test, TestingModule } from '@nestjs/testing';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { User } from '@career-covered/db';

describe('TemplateController', () => {
  let controller: TemplateController;
  let service: TemplateService;

  const mockUser = { id: 'user-123', email: 'test@example.com' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        {
          provide: TemplateService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 't1' }),
            create: jest.fn().mockResolvedValue({ id: 't2' }),
            update: jest.fn().mockResolvedValue({ id: 't1' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TemplateController>(TemplateController);
    service = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should findAll templates for a user', async () => {
    const result = await controller.findAll(mockUser);
    expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual([]);
  });
});
