import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as express from 'express';
import * as db from '@career-covered/db';

/**
 * Extracts the authenticated user from the request object.
 * Set by AuthGuard after session validation.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): db.User => {
    const request = ctx
      .switchToHttp()
      .getRequest<express.Request & { user: db.User }>();
    return request.user;
  },
);
