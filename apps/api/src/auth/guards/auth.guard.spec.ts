import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import * as db from '@career-covered/db';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { validateSession: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  const mockUser = { id: 'user-1', email: 'test@example.com' } as db.User;

  const buildContext = (cookies: Record<string, string> = {}) => {
    const request = { cookies, user: undefined } as unknown as {
      cookies: Record<string, string>;
      user: db.User | undefined;
    };
    return {
      request,
      context: {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
    };
  };

  beforeEach(() => {
    authService = { validateSession: jest.fn() };
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    guard = new AuthGuard(
      authService as unknown as AuthService,
      reflector as unknown as Reflector,
    );
  });

  it('allows public routes without checking a session', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const { context } = buildContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateSession).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when there is no session cookie', async () => {
    const { context } = buildContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.validateSession).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when the session is invalid or expired', async () => {
    authService.validateSession.mockResolvedValue(null);
    const { context } = buildContext({ session: 'bad-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.validateSession).toHaveBeenCalledWith('bad-token');
  });

  it('attaches the user to the request and allows the request through', async () => {
    authService.validateSession.mockResolvedValue(mockUser);
    const { context, request } = buildContext({ session: 'good-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(mockUser);
  });
});
