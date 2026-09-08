import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-groq-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
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
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should proxy the request to Groq and return the response as-is (no DB/session involvement)', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'hello' } }],
      }),
    });
    global.fetch = fetchMock;

    const result = await service.generate({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'test' }],
      wordLimit: 100,
      jobTitle: 'Software Engineer',
      companyName: 'Google',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-groq-key',
        }),
      }),
    );
    expect(result).toEqual({
      choices: [{ message: { content: 'hello' } }],
    });
  });

  it('should forward reasoning_effort through to the Groq request body', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'hello' } }],
      }),
    });
    global.fetch = fetchMock;

    await service.generate({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'test' }],
      reasoning_effort: 'low',
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sentBody = JSON.parse(options.body as string) as Record<
      string,
      unknown
    >;
    expect(sentBody.reasoning_effort).toBe('low');
  });

  it('should throw when Groq returns 200 with no completion content', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: {} }],
      }),
    });
    global.fetch = fetchMock;

    await expect(
      service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should throw when Groq returns 200 with an empty choices array', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ choices: [] }),
    });
    global.fetch = fetchMock;

    await expect(
      service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should use the caller-supplied API key over the configured fallback', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'hello' } }],
      }),
    });
    global.fetch = fetchMock;

    await service.generate({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'test' }],
      userApiKey: 'user-supplied-key',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer user-supplied-key',
        }),
      }),
    );
  });
});
