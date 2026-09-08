import { paginate, paginationSkip } from './paginate';
import { PrismaService } from '../prisma/prisma.service';

describe('paginationSkip', () => {
  it('returns 0 for the first page', () => {
    expect(paginationSkip(1, 10)).toBe(0);
  });

  it('skips a full page of items for the second page', () => {
    expect(paginationSkip(2, 10)).toBe(10);
  });

  it('scales with a different limit', () => {
    expect(paginationSkip(3, 25)).toBe(50);
  });
});

describe('paginate', () => {
  const mockPrismaService = {
    $transaction: jest
      .fn()
      .mockImplementation((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
  } as unknown as PrismaService;

  it('combines data and total from a single transaction', async () => {
    const findMany = Promise.resolve([{ id: '1' }, { id: '2' }]);
    const count = Promise.resolve(2);

    const result = await paginate(
      mockPrismaService,
      findMany as never,
      count as never,
      1,
      10,
    );

    expect(result).toEqual({
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('rounds totalPages up when total is not an exact multiple of limit', async () => {
    const findMany = Promise.resolve([{ id: '1' }]);
    const count = Promise.resolve(21);

    const result = await paginate(
      mockPrismaService,
      findMany as never,
      count as never,
      3,
      10,
    );

    expect(result.totalPages).toBe(3);
  });

  it('returns totalPages 0 when there are no results', async () => {
    const findMany = Promise.resolve([]);
    const count = Promise.resolve(0);

    const result = await paginate(
      mockPrismaService,
      findMany as never,
      count as never,
      1,
      10,
    );

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  });
});
