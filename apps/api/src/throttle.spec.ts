import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard, Throttle } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';

// Mirrors the @Throttle({ default: { limit, ttl } }) config used on
// AiController.generate and AuthController.login/register, isolated from
// Prisma/Auth so this test doesn't need a real database.
@Controller('test-throttle')
class ThrottleTestController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  handle() {
    return { ok: true };
  }
}

describe('Rate limiting (ThrottlerGuard)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 30 }]),
      ],
      controllers: [ThrottleTestController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows requests up to the configured limit and blocks the next one with 429', async () => {
    const server = app.getHttpServer();

    await request(server).post('/test-throttle').expect(200);
    await request(server).post('/test-throttle').expect(200);
    await request(server).post('/test-throttle').expect(429);
  });
});
