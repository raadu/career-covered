import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import * as db from '@career-covered/db';

describe('ProfileService', () => {
  let service: ProfileService;

  const baseUser: db.User = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Jane Doe',
    avatarUrl: null,
    linkedinUrl: null,
    githubUrl: null,
    websiteUrl: null,
    contactEmail: null,
    phoneNumber: null,
    extraLink1Url: null,
    extraLink2Url: null,
    passwordHash: 'super-secret-hash',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn().mockResolvedValue(baseUser),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    jest.clearAllMocks();
    mockPrismaService.user.update.mockResolvedValue(baseUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLinks', () => {
    it('scopes the update to the given userId, with no id derivable from the DTO', async () => {
      await service.updateLinks('user-1', {
        linkedinUrl: 'https://linkedin.com/in/x',
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('omits a field from the update data entirely when not present on the DTO', async () => {
      await service.updateLinks('user-1', {
        linkedinUrl: 'https://linkedin.com/in/x',
      });
      const call = mockPrismaService.user.update.mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(call.data).toEqual({ linkedinUrl: 'https://linkedin.com/in/x' });
      expect('githubUrl' in call.data).toBe(false);
      expect('websiteUrl' in call.data).toBe(false);
      expect('contactEmail' in call.data).toBe(false);
      expect('phoneNumber' in call.data).toBe(false);
      expect('extraLink1Url' in call.data).toBe(false);
      expect('extraLink2Url' in call.data).toBe(false);
    });

    it('writes null for a field explicitly cleared (post-transform null on the DTO)', async () => {
      await service.updateLinks('user-1', { githubUrl: null });
      const call = mockPrismaService.user.update.mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(call.data).toEqual({ githubUrl: null });
    });

    it('includes all seven fields when all are present on the DTO', async () => {
      await service.updateLinks('user-1', {
        linkedinUrl: 'https://linkedin.com/in/x',
        githubUrl: 'https://github.com/x',
        websiteUrl: 'https://x.dev',
        contactEmail: 'x@example.com',
        phoneNumber: '+14155552671',
        extraLink1Url: 'https://portfolio.example.com',
        extraLink2Url: 'https://blog.example.com',
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          linkedinUrl: 'https://linkedin.com/in/x',
          githubUrl: 'https://github.com/x',
          websiteUrl: 'https://x.dev',
          contactEmail: 'x@example.com',
          phoneNumber: '+14155552671',
          extraLink1Url: 'https://portfolio.example.com',
          extraLink2Url: 'https://blog.example.com',
        },
      });
    });

    it('never returns passwordHash, even though the mocked Prisma row includes it', async () => {
      const result = await service.updateLinks('user-1', {});
      expect(result).not.toHaveProperty('passwordHash');
      expect(Object.keys(result).sort()).toEqual(
        [
          'avatarUrl',
          'contactEmail',
          'email',
          'extraLink1Url',
          'extraLink2Url',
          'githubUrl',
          'id',
          'linkedinUrl',
          'name',
          'phoneNumber',
          'websiteUrl',
        ].sort(),
      );
    });

    it('maps the updated row to the response shape', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce({
        ...baseUser,
        linkedinUrl: 'https://linkedin.com/in/x',
      });
      const result = await service.updateLinks('user-1', {
        linkedinUrl: 'https://linkedin.com/in/x',
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        avatarUrl: null,
        linkedinUrl: 'https://linkedin.com/in/x',
        githubUrl: null,
        websiteUrl: null,
        contactEmail: null,
        phoneNumber: null,
        extraLink1Url: null,
        extraLink2Url: null,
      });
    });

    it('writes null for a cleared extra link and returns the other one unchanged', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce({
        ...baseUser,
        extraLink1Url: null,
        extraLink2Url: 'https://blog.example.com',
      });
      const result = await service.updateLinks('user-1', {
        extraLink1Url: null,
      });
      const call = mockPrismaService.user.update.mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(call.data).toEqual({ extraLink1Url: null });
      expect(result.extraLink1Url).toBeNull();
      expect(result.extraLink2Url).toBe('https://blog.example.com');
    });
  });
});
