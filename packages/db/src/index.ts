// Re-export the Prisma client and all generated types from a single entry point.
// This means all apps only need to import from '@career-covered/db' instead of
// importing directly from '@prisma/client', keeping the dependency centralized.
export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
