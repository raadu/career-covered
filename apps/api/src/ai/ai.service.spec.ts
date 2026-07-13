import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;
  let prisma: PrismaService;
  let authService: AuthService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-groq-key'),
  };

  const mockPrismaService = {
    coverLetter: {
      create: jest.fn().mockResolvedValue({ id: 'cl-1' }),
    },
  };

  const mockAuthService = {
    validateSession: jest.fn().mockResolvedValue({ id: 'user-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if no API key is configured', async () => {
    mockConfigService.get.mockReturnValueOnce(null);
    await expect(
      service.generate({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should fetch cover letter and save to db if session exists', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'hello' } }],
      }),
    });
    global.fetch = fetchMock;

    const result = await service.generate(
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'test' }],
        wordLimit: 100,
        jobTitle: 'Software Engineer',
        companyName: 'Google',
      },
      'mock-session',
    );

    expect(fetchMock).toHaveBeenCalled();
    expect(authService.validateSession).toHaveBeenCalledWith('mock-session');
    expect(prisma.coverLetter.create).toHaveBeenCalled();
    expect(result).toEqual({
      choices: [{ message: { content: 'hello' } }],
    });
  });
});
