import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '@career-covered/db';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockUser = { id: 'user-123', email: 'test@example.com' } as User;

  const mockResponse = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Jane Doe',
    avatarUrl: null,
    linkedinUrl: 'https://linkedin.com/in/x',
    githubUrl: null,
    websiteUrl: null,
    contactEmail: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            updateLinks: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('updateLinks delegates to the service with the authenticated user id, never a body-supplied one', async () => {
    const dto = { linkedinUrl: 'https://linkedin.com/in/x' };
    const result = await controller.updateLinks(dto, mockUser);
    expect(service.updateLinks).toHaveBeenCalledWith(mockUser.id, dto);
    expect(result).toEqual(mockResponse);
  });
});
