import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import * as db from '@career-covered/db';

const SESSION_COOKIE = 'session';
// Fail closed: only skip `Secure` for the explicit local-dev case (running
// over plain http://localhost). Any other/missing NODE_ENV value defaults to
// secure — a forgotten env var should never silently produce an insecure
// cookie on a real deployment.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  path: '/',
};

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

// Temporary store for OAuth state & code verifier (use Redis in production).
// Entries are only ever removed on successful callback completion, so an
// abandoned /auth/google flow (bot, closed tab) would otherwise leak forever
// — sweep expired entries periodically to bound memory growth.
const oauthStateStore = new Map<
  string,
  { codeVerifier: string; expiresAt: number }
>();

setInterval(() => {
  const now = Date.now();
  for (const [state, entry] of oauthStateStore) {
    if (entry.expiresAt < now) {
      oauthStateStore.delete(state);
    }
  }
}, OAUTH_STATE_TTL_MS).unref();

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register with email & password' })
  // Tight cap — no lockout/CAPTCHA yet, so keep brute-force/spam-signup room narrow.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const user = await this.authService.register(
      dto.email,
      dto.name,
      dto.password,
    );
    const token = await this.authService.createSession(user.id);
    res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
    return { id: user.id, email: user.email, name: user.name };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email & password' })
  // Tight cap — no lockout/CAPTCHA yet, so keep brute-force room narrow.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const user = await this.authService.login(dto.email, dto.password);
    const token = await this.authService.createSession(user.id);
    res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
    return { id: user.id, email: user.email, name: user.name };
  }

  @Get('me')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: db.User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (token) {
      await this.authService.deleteSession(token);
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  // ─── Google OAuth ───────────────────────────────────────────────────────────

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  googleAuth(@Res() res: express.Response) {
    const { url, state, codeVerifier } = this.authService.createGoogleAuthUrl();
    // Store state + code verifier for 10 minutes
    oauthStateStore.set(state, {
      codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    res.redirect(url);
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: express.Response,
  ) {
    const stored = oauthStateStore.get(state);
    if (!stored || stored.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
    oauthStateStore.delete(state);

    const user = await this.authService.handleGoogleCallback(
      code,
      stored.codeVerifier,
    );
    const token = await this.authService.createSession(user.id);
    res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);

    const webUrl = process.env.WEB_URL ?? 'http://localhost:5173';
    res.redirect(`${webUrl}/`);
  }
}
