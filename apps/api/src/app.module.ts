import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { TemplateModule } from './template/template.module';
import { CoverLetterModule } from './cover-letter/cover-letter.module';

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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
