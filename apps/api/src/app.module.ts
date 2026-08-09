import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { TemplateModule } from './template/template.module';
import { CoverLetterModule } from './cover-letter/cover-letter.module';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [
    // Load .env variables globally
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),

    // Pino structured logger — pretty-print in dev, JSON in prod
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              }
            : undefined,
        level: process.env.LOG_LEVEL ?? 'info',
        // Session cookies and auth headers must never land in logs, even in
        // structured/JSON form — redact them regardless of environment.
        redact: {
          paths: [
            'req.headers.cookie',
            'req.headers.authorization',
            'res.headers["set-cookie"]',
          ],
          censor: '[REDACTED]',
        },
      },
    }),

    // Default rate limit for every route (30 req/min per IP); routes that
    // are expensive or brute-force-sensitive (AI generation, login,
    // register) override this with a stricter @Throttle() of their own.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 30 }]),

    PrismaModule,
    AiModule,
    AuthModule,
    TemplateModule,
    CoverLetterModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
