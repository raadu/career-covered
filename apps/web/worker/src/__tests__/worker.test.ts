import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../index';

type WorkerEnv = Parameters<typeof worker.fetch>[1];

const makeEnv = (overrides: Partial<WorkerEnv> = {}) => {
  const assetsFetch = vi.fn(async () => new Response('<html>app</html>'));
  const env = {
    ASSETS: { fetch: assetsFetch } as unknown as WorkerEnv['ASSETS'],
    BACKEND_URL: 'https://api.careercovered.com',
    CANONICAL_HOST: 'careercovered.com',
    ...overrides,
  } as WorkerEnv;
  return { env, assetsFetch };
};

describe('worker fetch handler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('301-redirects a www page load to the apex, keeping path and query', async () => {
    const { env, assetsFetch } = makeEnv();
    const res = await worker.fetch(
      new Request('https://www.careercovered.com/faq?ref=ad'),
      env,
    );

    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe(
      'https://careercovered.com/faq?ref=ad',
    );
    expect(assetsFetch).not.toHaveBeenCalled();
  });

  it('redirects www /auth/google too, so the OAuth round-trip starts on the apex', async () => {
    const { env } = makeEnv();
    const res = await worker.fetch(
      new Request('https://www.careercovered.com/auth/google'),
      env,
    );
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe(
      'https://careercovered.com/auth/google',
    );
  });

  it('serves the apex from static assets without redirecting', async () => {
    const { env, assetsFetch } = makeEnv();
    const res = await worker.fetch(
      new Request('https://careercovered.com/'),
      env,
    );
    expect(res.status).toBe(200);
    expect(assetsFetch).toHaveBeenCalledOnce();
  });

  it('still proxies a www POST to the API instead of redirecting it', async () => {
    const backendFetch = vi.fn(async () => new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', backendFetch);
    const { env } = makeEnv();

    // No body: Node's Request (unlike the Workers runtime) requires a
    // `duplex` option to forward a streamed body, which the proxy doesn't set.
    // Routing — proxied, not redirected — is what's under test here.
    const res = await worker.fetch(
      new Request('https://www.careercovered.com/api/cover-letters', {
        method: 'POST',
      }),
      env,
    );

    expect(res.status).toBe(201);
    const [proxied] = backendFetch.mock.calls[0] as unknown as [Request];
    expect(proxied.url).toBe('https://api.careercovered.com/api/cover-letters');
    expect(proxied.method).toBe('POST');
  });

  it('never redirects when CANONICAL_HOST is unset (local dev)', async () => {
    const { env, assetsFetch } = makeEnv({ CANONICAL_HOST: undefined });
    const res = await worker.fetch(
      new Request('https://www.careercovered.com/'),
      env,
    );
    expect(res.status).toBe(200);
    expect(assetsFetch).toHaveBeenCalledOnce();
  });
});
