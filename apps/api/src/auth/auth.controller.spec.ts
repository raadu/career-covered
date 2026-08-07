import { Test, TestingModule } from '@nestjs/testing';
import * as express from 'express';
import { AuthController, buildCookieOptions } from './auth.controller';
import { AuthService } from './auth.service';
import * as db from '@career-covered/db';

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
});
