import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import type express from 'express';
import { AppModule } from './app.module';

const IS_LOCAL_ENV =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * Simple Basic Auth gate for Swagger. Only enforced when SWAGGER_USER /
 * SWAGGER_PASSWORD are configured — left open if unset (e.g. local dev).
 */
function swaggerBasicAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const user = process.env.SWAGGER_USER;
  const password = process.env.SWAGGER_PASSWORD;
  if (!user || !password) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (header?.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8');
    const separatorIndex = decoded.indexOf(':');
    const reqUser = decoded.slice(0, separatorIndex);
    const reqPassword = decoded.slice(separatorIndex + 1);
    if (reqUser === user && reqPassword === password) {
      next();
      return;
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Swagger"');
  res.status(401).send('Authentication required');
}

async function bootstrap() {
  // Fail closed rather than silently falling back to a dev-only CORS origin:
  // a missing WEB_URL outside local dev means the real frontend can never
  // talk to the API, and that should be a loud boot-time error, not a
  // mysteriously broken CORS failure discovered later.
  if (!IS_LOCAL_ENV && !process.env.WEB_URL) {
    throw new Error(
      'WEB_URL must be set when NODE_ENV is not "development"/"test" — refusing to start with an unsafe CORS default.',
    );
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino as the application logger
  app.useLogger(app.get(Logger));

  // Global validation pipe — strip unknown fields, transform payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser for HTTP-only session cookies
  app.use(cookieParser());

  // CORS — allow the Vite dev server (or the real frontend origin in prod)
  app.enableCors({
    origin: process.env.WEB_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Swagger / OpenAPI docs — gated behind Basic Auth once SWAGGER_USER /
  // SWAGGER_PASSWORD are configured (see swaggerBasicAuth above).
  app.use('/docs', swaggerBasicAuth);
  app.use('/docs-json', swaggerBasicAuth);

  const config = new DocumentBuilder()
    .setTitle('Career Covered API')
    .setDescription('REST API for the Career Covered cover-letter generator')
    .setVersion('1.0')
    .addCookieAuth('session')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}
void bootstrap();
