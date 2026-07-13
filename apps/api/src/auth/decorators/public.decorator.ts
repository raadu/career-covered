import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Mark a route as public — the AuthGuard will skip session validation.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
