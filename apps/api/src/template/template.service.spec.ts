import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TemplateService', () => {
  let service: TemplateService;
  let prisma: PrismaService;

  const mockPrismaService = {
    template: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue({ id: 't1' }),
      create: jest.fn().mockResolvedValue({ id: 't2' }),
      update: jest.fn().mockResolvedValue({ id: 't1' }),
      delete: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn().mockImplementation((queries: Promise<any>[]) => Promise.all(queries)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if template does not exist', async () => {
    mockPrismaService.template.findFirst.mockResolvedValueOnce(null);
    await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
