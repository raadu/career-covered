import { describe, it, expect, vi, afterEach } from 'vitest';
import { createTestStore } from '../../../tests/test-utils';
import { apiSlice } from 'store/apiSlice';

vi.mock('utils/apiConfigUtils', () => ({
  GROQ_BASE_URL: 'http://localhost/api',
  API_ENDPOINTS: { CHAT_COMPLETIONS: '/generate' },
}));

describe('apiSlice.generateCoverLetter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with the message content on a normal response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              choices: [{ message: { content: 'Dear Hiring Manager...' } }],
            }),
            { status: 200 },
          ),
      ),
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        apiSlice.endpoints.generateCoverLetter.initiate({
          prompt: 'write a letter',
          model: 'openai/gpt-oss-120b',
        }),
      )
      .unwrap();

    expect(result).toBe('Dear Hiring Manager...');
  });

  it('requests low reasoning effort to leave token budget for the letter itself', async () => {
    let capturedBody: string | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody =
        init?.body !== undefined
          ? (init.body as string)
          : await (input as Request).clone().text();
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'Dear...' } }] }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const store = createTestStore();
    await store
      .dispatch(
        apiSlice.endpoints.generateCoverLetter.initiate({
          prompt: 'write a letter',
          model: 'openai/gpt-oss-120b',
        }),
      )
      .unwrap();

    expect(JSON.parse(capturedBody!).reasoning_effort).toBe('low');
  });

  it('rejects instead of resolving with a placeholder when Groq returns no content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ choices: [{ message: {} }] }), {
            status: 200,
          }),
      ),
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(
          apiSlice.endpoints.generateCoverLetter.initiate({
            prompt: 'write a letter',
            model: 'openai/gpt-oss-120b',
          }),
        )
        .unwrap(),
    ).rejects.toBeDefined();
  });

  it('rejects when the choices array is missing entirely', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(
          apiSlice.endpoints.generateCoverLetter.initiate({
            prompt: 'write a letter',
            model: 'openai/gpt-oss-120b',
          }),
        )
        .unwrap(),
    ).rejects.toBeDefined();
  });

  it('rejects when the message content is an empty string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ choices: [{ message: { content: '' } }] }),
            { status: 200 },
          ),
      ),
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(
          apiSlice.endpoints.generateCoverLetter.initiate({
            prompt: 'write a letter',
            model: 'openai/gpt-oss-120b',
          }),
        )
        .unwrap(),
    ).rejects.toBeDefined();
  });

  it('includes userApiKey in the request body when provided', async () => {
    let capturedBody: string | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody =
        init?.body !== undefined
          ? (init.body as string)
          : await (input as Request).clone().text();
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'Dear...' } }] }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const store = createTestStore();
    await store
      .dispatch(
        apiSlice.endpoints.generateCoverLetter.initiate({
          prompt: 'write a letter',
          model: 'openai/gpt-oss-120b',
          userApiKey: 'gsk_test_key',
        }),
      )
      .unwrap();

    expect(JSON.parse(capturedBody!).userApiKey).toBe('gsk_test_key');
  });

  it('omits userApiKey from the request body entirely when not provided', async () => {
    let capturedBody: string | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody =
        init?.body !== undefined
          ? (init.body as string)
          : await (input as Request).clone().text();
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'Dear...' } }] }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const store = createTestStore();
    await store
      .dispatch(
        apiSlice.endpoints.generateCoverLetter.initiate({
          prompt: 'write a letter',
          model: 'openai/gpt-oss-120b',
        }),
      )
      .unwrap();

    expect('userApiKey' in JSON.parse(capturedBody!)).toBe(false);
  });

  it('rejects when the network request itself fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(
          apiSlice.endpoints.generateCoverLetter.initiate({
            prompt: 'write a letter',
            model: 'openai/gpt-oss-120b',
          }),
        )
        .unwrap(),
    ).rejects.toBeDefined();
  });

  it('rejects when the upstream responds with a non-2xx status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: 'rate limited' }), {
            status: 429,
          }),
      ),
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(
          apiSlice.endpoints.generateCoverLetter.initiate({
            prompt: 'write a letter',
            model: 'openai/gpt-oss-120b',
          }),
        )
        .unwrap(),
    ).rejects.toBeDefined();
  });
});
