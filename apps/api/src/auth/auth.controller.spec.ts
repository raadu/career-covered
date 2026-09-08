import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as express from 'express';
import {
  AuthController,
  buildCookieOptions,
  sweepExpiredOAuthStates,
} from './auth.controller';
import { AuthService } from './auth.service';
import * as db from '@career-covered/db';

type OAuthStateStore = Map<string, { codeVerifier: string; expiresAt: number }>;

describe('sweepExpiredOAuthStates', () => {
  it('removes only entries past their expiry', () => {
    const now = Date.now();
    const store: OAuthStateStore = new Map([
      ['expired', { codeVerifier: 'v1', expiresAt: now - 1000 }],
      ['fresh', { codeVerifier: 'v2', expiresAt: now + 60_000 }],
    ]);

    sweepExpiredOAuthStates(store);

    expect(store.has('expired')).toBe(false);
    expect(store.has('fresh')).toBe(true);
  });

  it('does nothing when the store is empty', () => {
    const store: OAuthStateStore = new Map();
    expect(() => sweepExpiredOAuthStates(store)).not.toThrow();
    expect(store.size).toBe(0);
  });
});

describe('buildCookieOptions', () => {
  it('omits domain when no cookie domain is given', () => {
    expect(buildCookieOptions(undefined)).not.toHaveProperty('domain');
  });

  it('sets domain when a cookie domain is given', () => {
    // This is the fix for Google OAuth: without it, the session cookie set
    // on api.careercovered.com's own host never reaches careercovered.com.
    expect(buildCookieOptions('.careercovered.com')).toMatchObject({
      domain: '.careercovered.com',
    });
  });

  it('always sets httpOnly, sameSite=lax and path=/', () => {
    expect(buildCookieOptions(undefined)).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  });
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: null,
  } as db.User;

  const mockRes = () =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    }) as unknown as express.Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
            login: jest.fn().mockResolvedValue(mockUser),
            createSession: jest.fn().mockResolvedValue('session-token'),
            deleteSession: jest.fn().mockResolvedValue(undefined),
            createGoogleAuthUrl: jest.fn(),
            handleGoogleCallback: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sets the session cookie on register', async () => {
    const res = mockRes();
    const result = await controller.register(
      { email: 'test@example.com', name: 'Test User', password: 'pw' },
      res,
    );

    expect(service.register).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      'pw',
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'session',
      'session-token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
    });
  });

  it('sets the session cookie on login', async () => {
    const res = mockRes();
    await controller.login({ email: 'test@example.com', password: 'pw' }, res);

    expect(service.login).toHaveBeenCalledWith('test@example.com', 'pw');
    expect(res.cookie).toHaveBeenCalledWith(
      'session',
      'session-token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });

  it('clears the session cookie on logout using the same path/domain it was set with', async () => {
    const res = mockRes();
    const req = { cookies: { session: 'session-token' } } as express.Request;

    await controller.logout(req, res);

    expect(service.deleteSession).toHaveBeenCalledWith('session-token');
    expect(res.clearCookie).toHaveBeenCalledWith(
      'session',
      expect.objectContaining({ path: '/' }),
    );
  });

  it('does not call deleteSession when there is no session cookie', async () => {
    const res = mockRes();
    const req = { cookies: {} } as express.Request;

    await controller.logout(req, res);

    expect(service.deleteSession).not.toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalled();
  });

  it('returns the current user on me', () => {
    expect(controller.me(mockUser)).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      avatarUrl: mockUser.avatarUrl,
    });
  });

  describe('Google OAuth', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('redirects to the generated Google auth URL and stores the state', () => {
      const res = mockRes();
      (service.createGoogleAuthUrl as jest.Mock).mockReturnValue({
        url: 'https://accounts.google.com/o/oauth2/auth?state=abc',
        state: 'state-1',
        codeVerifier: 'verifier-1',
      });

      controller.googleAuth(res);

      expect(service.createGoogleAuthUrl).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/auth?state=abc',
      );
    });

    it('throws UnauthorizedException when the state was never stored', async () => {
      const res = mockRes();

      await expect(
        controller.googleCallback('code', 'never-stored-state', res),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.handleGoogleCallback).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the stored state has expired', async () => {
      (service.createGoogleAuthUrl as jest.Mock).mockReturnValue({
        url: 'https://accounts.google.com/o/oauth2/auth',
        state: 'state-expired',
        codeVerifier: 'verifier-expired',
      });
      controller.googleAuth(mockRes());

      jest.useFakeTimers().setSystemTime(Date.now() + 11 * 60 * 1000);

      const res = mockRes();
      await expect(
        controller.googleCallback('code', 'state-expired', res),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.handleGoogleCallback).not.toHaveBeenCalled();
    });

    it('exchanges the code, creates a session, sets the cookie, and redirects to the web app', async () => {
      (service.createGoogleAuthUrl as jest.Mock).mockReturnValue({
        url: 'https://accounts.google.com/o/oauth2/auth',
        state: 'state-valid',
        codeVerifier: 'verifier-valid',
      });
      controller.googleAuth(mockRes());
      (service.handleGoogleCallback as jest.Mock).mockResolvedValue(mockUser);

      const res = mockRes();
      await controller.googleCallback('auth-code', 'state-valid', res);

      expect(service.handleGoogleCallback).toHaveBeenCalledWith(
        'auth-code',
        'verifier-valid',
      );
      expect(service.createSession).toHaveBeenCalledWith(mockUser.id);
      expect(res.cookie).toHaveBeenCalledWith(
        'session',
        'session-token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/'));
    });

    it('rejects a state that was already consumed by a previous callback (replay protection)', async () => {
      (service.createGoogleAuthUrl as jest.Mock).mockReturnValue({
        url: 'https://accounts.google.com/o/oauth2/auth',
        state: 'state-reuse',
        codeVerifier: 'verifier-reuse',
      });
      controller.googleAuth(mockRes());
      (service.handleGoogleCallback as jest.Mock).mockResolvedValue(mockUser);

      await controller.googleCallback('auth-code', 'state-reuse', mockRes());

      await expect(
        controller.googleCallback('auth-code', 'state-reuse', mockRes()),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
