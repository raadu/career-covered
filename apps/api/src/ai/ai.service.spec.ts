import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, Logger } from '@nestjs/common';

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

  it('surfaces the Groq error message when Groq responds with a non-2xx status', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: jest
        .fn()
        .mockResolvedValue({ error: { message: 'Invalid API key' } }),
    });
    global.fetch = fetchMock;

    await expect(
      service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow('Invalid API key');
  });

  it('falls back to a generic message when Groq responds with a non-2xx status and no error body', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });
    global.fetch = fetchMock;

    await expect(
      service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow('Groq API request failed');
  });

  it('propagates rejection when the network request to Groq itself fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('fetch failed'));

    await expect(
      service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
      }),
    ).rejects.toThrow('fetch failed');
  });

  it('never forwards userApiKey or the app-only rule fields to Groq in the request body', async () => {
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
      jobDescription: 'JD',
      templateId: 't1',
      jobTitle: 'Engineer',
      companyName: 'Acme',
      wordLimit: 100,
      minimalChanges: true,
      sameLanguage: true,
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(options.body as string)).toEqual({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: 'test' }],
    });
  });

  describe('rule validation (warn-only, never blocks the response)', () => {
    let warnSpy: jest.SpyInstance;

    const mockGroqReply = (content: string) => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ choices: [{ message: { content } }] }),
      });
    };

    beforeEach(() => {
      warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns when the output exceeds the requested word limit, but still returns it', async () => {
      mockGroqReply('one two three four five six');

      const result = await service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
        wordLimit: 5,
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Output has 6 words, limit requested was 5'),
      );
      expect(result).toEqual({
        choices: [{ message: { content: 'one two three four five six' } }],
      });
    });

    it('does not warn when the output is exactly at the word limit, counting collapsed whitespace correctly', async () => {
      mockGroqReply('  one\ttwo\n\nthree   four five  ');

      await service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
        wordLimit: 5,
      });

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns when sameLanguage is on and the output language profile differs from the job description', async () => {
      mockGroqReply('Sehr geehrte Damen und Herren, ich bewerbe mich hiermit.');

      await service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
        sameLanguage: true,
        jobDescription: 'We are looking for an engineer to join the team.',
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Language Constraint'),
      );
    });

    it('does not warn when sameLanguage is on and both texts share a language profile', async () => {
      mockGroqReply('I am excited to apply for the role at your company.');

      await service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
        sameLanguage: true,
        jobDescription: 'We are looking for an engineer to join the team.',
      });

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('skips the language check when sameLanguage is on but no job description was sent', async () => {
      mockGroqReply('Sehr geehrte Damen und Herren.');

      await service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
        sameLanguage: true,
      });

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('skips the language check entirely when sameLanguage is off', async () => {
      mockGroqReply('Sehr geehrte Damen und Herren.');

      await service.generate({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'test' }],
        sameLanguage: false,
        jobDescription: 'We are looking for an engineer to join the team.',
      });

      expect(warnSpy).not.toHaveBeenCalled();
    });
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
