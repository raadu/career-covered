import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { THROTTLE_ERROR_MESSAGE } from '../src/common/throttle.constants';

// Throttler counters live in memory per app instance, so each test boots a
// fresh app to start from a clean window. Requests use invalid bodies: the
// ThrottlerGuard runs before the ValidationPipe, so they still count toward
// the limit while never creating a user or touching the database.
describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const post = (path: string) =>
    request(app.getHttpServer()).post(path).send({});

  it('allows 15 signups per minute under NODE_ENV=test, then returns the friendly 429', async () => {
    for (let i = 0; i < 15; i++) {
      await post('/auth/register').expect(400);
    }

    const res = await post('/auth/register').expect(429);
    expect(res.body.message).toBe(THROTTLE_ERROR_MESSAGE);
  });

  it('leaves login at its production cap of 5 per minute', async () => {
    for (let i = 0; i < 5; i++) {
      await post('/auth/login').expect(400);
    }

    const res = await post('/auth/login').expect(429);
    expect(res.body.message).toBe(THROTTLE_ERROR_MESSAGE);
    expect(JSON.stringify(res.body)).not.toContain('ThrottlerException');
  });

  it('counts signup and login limits independently', async () => {
    for (let i = 0; i < 5; i++) {
      await post('/auth/login').expect(400);
    }

    await post('/auth/register').expect(400);
  });
});
