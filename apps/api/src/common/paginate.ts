import type { Prisma } from '@career-covered/db';
import type { PrismaService } from '../prisma/prisma.service';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export async function paginate<T>(
  prisma: PrismaService,
  findMany: Prisma.PrismaPromise<T[]>,
  count: Prisma.PrismaPromise<number>,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const [data, total] = await prisma.$transaction([findMany, count]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
