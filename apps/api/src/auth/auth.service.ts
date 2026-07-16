import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Google, generateCodeVerifier, generateState } from 'arctic';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as db from '@career-covered/db';

const SESSION_EXPIRY_DAYS = 30;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private google: Google | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Lazy-initialize Google OAuth client.
   * Called once after the module is instantiated — uses get() not getOrThrow()
   * so it gracefully handles missing config (Google OAuth just won't work).
   */
  onModuleInit(): void {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI');

    if (clientId && clientSecret && redirectUri) {
      this.google = new Google(clientId, clientSecret, redirectUri);
      this.logger.log('Google OAuth configured successfully');
    } else {
      this.logger.warn(
        'Google OAuth is NOT configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI to enable it',
      );
    }
  }

  // ─── Email / Password ──────────────────────────────────────────────────────

  async register(
    email: string,
    name: string,
    password: string,
  ): Promise<db.User> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email, name, passwordHash },
    });
    this.logger.log(`Registered new user: ${user.id}`);
    return user;
  }

  async login(email: string, password: string): Promise<db.User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Email not registered');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('You forgot. You were using Google Login for this email. Please continue with Google.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  // ─── Session management ────────────────────────────────────────────────────

  async createSession(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.session.create({
      data: { id: token, userId, expiresAt },
    });

    return token;
  }

  async validateSession(token: string): Promise<db.User | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.session.delete({ where: { id: token } });
      }
      return null;
    }

    return session.user;
  }

  async deleteSession(token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: token } });
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  createGoogleAuthUrl(): { url: string; state: string; codeVerifier: string } {
    if (!this.google) {
      throw new UnauthorizedException(
        'Google OAuth is not configured on this server',
      );
    }
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = this.google.createAuthorizationURL(state, codeVerifier, [
      'openid',
      'profile',
      'email',
    ]);
    return { url: url.toString(), state, codeVerifier };
  }

  async handleGoogleCallback(
    code: string,
    codeVerifier: string,
  ): Promise<db.User> {
    if (!this.google) {
      throw new UnauthorizedException(
        'Google OAuth is not configured on this server',
      );
    }
    const tokens = await this.google.validateAuthorizationCode(
      code,
      codeVerifier,
    );
    const accessToken = tokens.accessToken();

    // Fetch Google profile
    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const profile = (await profileRes.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    // Find or create the OAuth account link
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'google',
          providerUserId: profile.sub,
        },
      },
      include: { user: true },
    });

    if (oauthAccount) {
      return oauthAccount.user;
    }

    // Check if a user with this email exists (link accounts)
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture,
        },
      });
    }

    await this.prisma.oAuthAccount.create({
      data: {
        provider: 'google',
        providerUserId: profile.sub,
        userId: user.id,
      },
    });

    this.logger.log(`Google OAuth: user ${user.id} authenticated`);
    return user;
  }
}
