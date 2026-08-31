import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Google } from 'arctic';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as db from '@career-covered/db';

jest.mock('bcrypt');
jest.mock('arctic', () => ({
  Google: jest.fn(),
  generateState: jest.fn().mockReturnValue('mock-state'),
  generateCodeVerifier: jest.fn().mockReturnValue('mock-code-verifier'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let config: Record<string, string | undefined>;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    oAuthAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => config[key]),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    avatarUrl: null,
  } as unknown as db.User;

  beforeEach(async () => {
    jest.clearAllMocks();
    config = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('does not configure Google OAuth when env vars are missing', () => {
      service.onModuleInit();
      expect(Google).not.toHaveBeenCalled();
    });

    it('configures Google OAuth when all env vars are present', () => {
      config = {
        GOOGLE_CLIENT_ID: 'client-id',
        GOOGLE_CLIENT_SECRET: 'client-secret',
        GOOGLE_REDIRECT_URI: 'https://example.com/callback',
      };
      service.onModuleInit();
      expect(Google).toHaveBeenCalledWith(
        'client-id',
        'client-secret',
        'https://example.com/callback',
      );
    });

    it('does not configure Google OAuth when only some env vars are present', () => {
      config = { GOOGLE_CLIENT_ID: 'client-id' };
      service.onModuleInit();
      expect(Google).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('creates a user with a hashed password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(
        'test@example.com',
        'Test User',
        'plain-password',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashed-password',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('throws ConflictException when the email is already registered', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register('test@example.com', 'Test User', 'plain-password'),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns the user when the password is valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@example.com', 'plain-password');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when no user has that email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('missing@example.com', 'plain-password'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws UnauthorizedException when the account has no password (Google-only)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: null,
      });

      await expect(
        service.login('test@example.com', 'plain-password'),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createSession', () => {
    it('creates a session expiring 30 days from now', async () => {
      mockPrismaService.session.create.mockResolvedValue({});
      const before = Date.now();

      const token = await service.createSession('user-1');

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(mockPrismaService.session.create).toHaveBeenCalledTimes(1);
      const callArgs = mockPrismaService.session.create.mock.calls[0][0];
      expect(callArgs.data.id).toBe(token);
      expect(callArgs.data.userId).toBe('user-1');
      const expiresAt = callArgs.data.expiresAt as Date;
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + thirtyDaysMs);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        Date.now() + thirtyDaysMs,
      );
    });

    it('generates a different token on every call', async () => {
      mockPrismaService.session.create.mockResolvedValue({});
      const first = await service.createSession('user-1');
      const second = await service.createSession('user-1');
      expect(first).not.toBe(second);
    });
  });

  describe('validateSession', () => {
    it('returns the user for a non-expired session', async () => {
      const future = new Date(Date.now() + 60_000);
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'token-1',
        expiresAt: future,
        user: mockUser,
      });

      const result = await service.validateSession('token-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.session.delete).not.toHaveBeenCalled();
    });

    it('returns null and does not query when no session exists', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      const result = await service.validateSession('missing-token');

      expect(result).toBeNull();
      expect(mockPrismaService.session.delete).not.toHaveBeenCalled();
    });

    it('deletes and returns null for an expired session', async () => {
      const past = new Date(Date.now() - 60_000);
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'token-1',
        expiresAt: past,
        user: mockUser,
      });
      mockPrismaService.session.delete.mockResolvedValue({});

      const result = await service.validateSession('token-1');

      expect(result).toBeNull();
      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({
        where: { id: 'token-1' },
      });
    });
  });

  describe('deleteSession', () => {
    it('deletes the session by token', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      await service.deleteSession('token-1');

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { id: 'token-1' },
      });
    });

    it('does not throw when the token does not exist', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteSession('missing-token'),
      ).resolves.toBeUndefined();
    });
  });

  describe('createGoogleAuthUrl', () => {
    it('throws UnauthorizedException when Google OAuth is not configured', () => {
      expect(() => service.createGoogleAuthUrl()).toThrow(
        UnauthorizedException,
      );
    });

    it('returns a url, state, and codeVerifier when configured', () => {
      config = {
        GOOGLE_CLIENT_ID: 'client-id',
        GOOGLE_CLIENT_SECRET: 'client-secret',
        GOOGLE_REDIRECT_URI: 'https://example.com/callback',
      };
      const mockAuthUrl = new URL('https://accounts.google.com/o/oauth2/auth');
      (Google as unknown as jest.Mock).mockImplementation(() => ({
        createAuthorizationURL: jest.fn().mockReturnValue(mockAuthUrl),
      }));
      service.onModuleInit();

      const result = service.createGoogleAuthUrl();

      expect(result).toEqual({
        url: mockAuthUrl.toString(),
        state: 'mock-state',
        codeVerifier: 'mock-code-verifier',
      });
    });
  });

  describe('handleGoogleCallback', () => {
    const setUpGoogle = (validateAuthorizationCode: jest.Mock) => {
      config = {
        GOOGLE_CLIENT_ID: 'client-id',
        GOOGLE_CLIENT_SECRET: 'client-secret',
        GOOGLE_REDIRECT_URI: 'https://example.com/callback',
      };
      (Google as unknown as jest.Mock).mockImplementation(() => ({
        validateAuthorizationCode,
      }));
      service.onModuleInit();
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('throws UnauthorizedException when Google OAuth is not configured', async () => {
      await expect(
        service.handleGoogleCallback('code', 'verifier'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns the existing user when the OAuth account is already linked', async () => {
      const validateAuthorizationCode = jest.fn().mockResolvedValue({
        accessToken: () => 'access-token',
      });
      setUpGoogle(validateAuthorizationCode);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: () =>
          Promise.resolve({
            sub: 'google-sub-1',
            email: 'test@example.com',
            name: 'Test User',
          }),
      } as Response);
      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue({
        user: mockUser,
      });

      const result = await service.handleGoogleCallback('code', 'verifier');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockPrismaService.oAuthAccount.create).not.toHaveBeenCalled();
    });

    it('links a new OAuth account to an existing user found by email', async () => {
      const validateAuthorizationCode = jest.fn().mockResolvedValue({
        accessToken: () => 'access-token',
      });
      setUpGoogle(validateAuthorizationCode);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: () =>
          Promise.resolve({
            sub: 'google-sub-2',
            email: 'existing@example.com',
            name: 'Existing User',
          }),
      } as Response);
      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.oAuthAccount.create.mockResolvedValue({});

      const result = await service.handleGoogleCallback('code', 'verifier');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockPrismaService.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          provider: 'google',
          providerUserId: 'google-sub-2',
          userId: mockUser.id,
        },
      });
    });

    it('creates a new user and links the OAuth account when neither exists', async () => {
      const validateAuthorizationCode = jest.fn().mockResolvedValue({
        accessToken: () => 'access-token',
      });
      setUpGoogle(validateAuthorizationCode);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: () =>
          Promise.resolve({
            sub: 'google-sub-3',
            email: 'new@example.com',
            name: 'New User',
            picture: 'https://example.com/avatar.png',
          }),
      } as Response);
      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const newUser = { ...mockUser, id: 'user-2', email: 'new@example.com' };
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.oAuthAccount.create.mockResolvedValue({});

      const result = await service.handleGoogleCallback('code', 'verifier');

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          name: 'New User',
          avatarUrl: 'https://example.com/avatar.png',
        },
      });
      expect(mockPrismaService.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          provider: 'google',
          providerUserId: 'google-sub-3',
          userId: newUser.id,
        },
      });
      expect(result).toEqual(newUser);
    });
  });
});
