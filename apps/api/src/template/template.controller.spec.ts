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
            removeBatch: jest.fn().mockResolvedValue(undefined),
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
    expect(service.findAll).toHaveBeenCalledWith(
      mockUser.id,
      undefined,
      undefined,
      false,
    );
    expect(result).toEqual([]);
  });

  it('should findAll with pagination', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    const result = await controller.findAll(mockUser, '1', '10');
    expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 1, 10, false);
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  });

  it('findOne delegates to the service with the authenticated user id, never a body/query-supplied one', async () => {
    const result = await controller.findOne('t1', mockUser);
    expect(service.findOne).toHaveBeenCalledWith('t1', mockUser.id);
    expect(result).toEqual({ id: 't1' });
  });

  it('create delegates to the service scoped to the authenticated user id', async () => {
    const dto = { name: 'My Template', content: 'Dear Hiring Manager' };
    const result = await controller.create(dto, mockUser);
    expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
    expect(result).toEqual({ id: 't2' });
  });

  it('update delegates to the service scoped to the authenticated user id', async () => {
    const dto = { name: 'Renamed', content: 'New content' };
    const result = await controller.update('t1', dto, mockUser);
    expect(service.update).toHaveBeenCalledWith('t1', mockUser.id, dto);
    expect(result).toEqual({ id: 't1' });
  });

  it('remove delegates to the service scoped to the authenticated user id', async () => {
    await controller.remove('t1', mockUser);
    expect(service.remove).toHaveBeenCalledWith('t1', mockUser.id);
  });

  it('removeBatch delegates to the service scoped to the authenticated user id, never a client-supplied one', async () => {
    await controller.removeBatch({ ids: ['t1', 't2'] }, mockUser);
    expect(service.removeBatch).toHaveBeenCalledWith(['t1', 't2'], mockUser.id);
  });
});
