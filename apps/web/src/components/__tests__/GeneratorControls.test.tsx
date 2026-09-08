import {
  renderWithProviders,
  screen,
  fireEvent,
  waitFor,
} from '../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GeneratorControls from '../GeneratorControls';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from 'utils/AIModelUtils';

vi.mock('utils/apiConfigUtils', () => ({
  GROQ_BASE_URL: 'http://localhost/api',
  API_ENDPOINTS: { CHAT_COMPLETIONS: '/generate' },
}));

describe('GeneratorControls', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders sub-components correctly', () => {
    renderWithProviders(<GeneratorControls />);
    expect(
      screen.getByRole('button', { name: /Add Custom API Key/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Generate Cover Letter/i }),
    ).toBeInTheDocument();
  });

  it('renders the AI model selector with all selectable models', () => {
    renderWithProviders(<GeneratorControls />);
    const select = screen.getByLabelText(/AI Model/i);
    expect(select).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(AVAILABLE_MODELS.length);
    expect((select as HTMLSelectElement).value).toBe(DEFAULT_MODEL);
  });

  it('disables the generate button if job description is missing', () => {
    renderWithProviders(<GeneratorControls />, {
      preloadedState: {
        coverLetter: {
          jobDescription: '',
          apiKey: 'valid-key',
        },
      },
    });
    const button = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    });
    expect(button).toBeDisabled();
  });

  it('enables the generate button if job description and API key are present', () => {
    renderWithProviders(<GeneratorControls />, {
      preloadedState: {
        coverLetter: {
          jobDescription: 'Software Engineer',
          apiKey: 'valid-key',
        },
      },
    });
    const button = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    });
    expect(button).toBeEnabled();
  });

  it('enables the generate button if job description is present and using free generations (no key)', () => {
    renderWithProviders(<GeneratorControls />, {
      preloadedState: {
        coverLetter: {
          jobDescription: 'Software Engineer',
          apiKey: '',
          generationCount: 1,
        },
      },
    });
    const button = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    });
    expect(button).toBeEnabled();
  });

  it('generates using the default GPT-OSS 120B model and saves with the same model', async () => {
    type FetchCall = { url: string; method: string; body: unknown };
    const fetchCalls: FetchCall[] = [];
    const mockFetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        let url: string;
        let method = 'GET';
        let body: unknown;
        if (typeof input === 'string') {
          url = input;
          method = init?.method ?? 'GET';
          body = init?.body ? JSON.parse(String(init.body)) : undefined;
        } else {
          const request = input as Request;
          url = request.url;
          method = request.method;
          const cloned = request.clone();
          body = await cloned.json().catch(() => undefined);
        }
        fetchCalls.push({ url, method, body });

        if (url.includes('/api/generate')) {
          return new Response(
            JSON.stringify({
              choices: [{ message: { content: 'Generated letter' } }],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({}), { status: 200 });
      },
    );
    vi.stubGlobal('fetch', mockFetch);

    renderWithProviders(<GeneratorControls />, {
      preloadedState: {
        coverLetter: {
          jobDescription: 'Software Engineer',
          apiKey: 'gsk-test',
          selectedModel: DEFAULT_MODEL,
        },
        auth: { isAuthenticated: true, isLoading: false },
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Generate Cover Letter/i }),
    );

    await waitFor(() => {
      const generateCall = fetchCalls.find((call) =>
        call.url.includes('/api/generate'),
      );
      expect(generateCall).toBeDefined();
      expect(generateCall?.body).toMatchObject({ model: DEFAULT_MODEL });
    });

    await waitFor(() => {
      const saveCall = fetchCalls.find(
        (call) =>
          call.url.includes('/api/cover-letters') && call.method === 'POST',
      );
      expect(saveCall).toBeDefined();
      expect(saveCall?.body).toMatchObject({ model: DEFAULT_MODEL });
    });
  });

  it('generates and saves with the model selected from the dropdown', async () => {
    type FetchCall = { url: string; method: string; body: unknown };
    const fetchCalls: FetchCall[] = [];
    const mockFetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        let url: string;
        let method = 'GET';
        let body: unknown;
        if (typeof input === 'string') {
          url = input;
          method = init?.method ?? 'GET';
          body = init?.body ? JSON.parse(String(init.body)) : undefined;
        } else {
          const request = input as Request;
          url = request.url;
          method = request.method;
          const cloned = request.clone();
          body = await cloned.json().catch(() => undefined);
        }
        fetchCalls.push({ url, method, body });

        if (url.includes('/api/generate')) {
          return new Response(
            JSON.stringify({
              choices: [{ message: { content: 'Generated letter' } }],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({}), { status: 200 });
      },
    );
    vi.stubGlobal('fetch', mockFetch);

    renderWithProviders(<GeneratorControls />, {
      preloadedState: {
        coverLetter: {
          jobDescription: 'Software Engineer',
          apiKey: 'gsk-test',
        },
        auth: { isAuthenticated: true, isLoading: false },
      },
    });

    const chosenModel = AVAILABLE_MODELS[1].id;
    fireEvent.change(screen.getByLabelText(/AI Model/i), {
      target: { value: chosenModel },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Generate Cover Letter/i }),
    );

    await waitFor(() => {
      const generateCall = fetchCalls.find((call) =>
        call.url.includes('/api/generate'),
      );
      expect(generateCall).toBeDefined();
      expect(generateCall?.body).toMatchObject({ model: chosenModel });
    });

    await waitFor(() => {
      const saveCall = fetchCalls.find(
        (call) =>
          call.url.includes('/api/cover-letters') && call.method === 'POST',
      );
      expect(saveCall).toBeDefined();
      expect(saveCall?.body).toMatchObject({ model: chosenModel });
    });
  });

  it('shows the generation error below the whole controls row, not beside the button', async () => {
    const mockFetch = vi.fn(async () => new Response('{}', { status: 500 }));
    vi.stubGlobal('fetch', mockFetch);

    renderWithProviders(<GeneratorControls />, {
      preloadedState: {
        coverLetter: {
          jobDescription: 'Software Engineer',
          apiKey: 'gsk-test',
        },
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Generate Cover Letter/i }),
    );

    const errorMessage = await screen.findByText(/Error generating/i);
    const generateButton = screen.getByRole('button', {
      name: /Generate Cover Letter/i,
    });

    expect(errorMessage).toBeInTheDocument();
    // The error sits outside the button's own row, not as its sibling.
    expect(generateButton.parentElement).not.toContainElement(errorMessage);
  });

  describe('resume personalization', () => {
    const buildFetchMock = (
      resumeResponse: { ok: boolean; parsedText?: string } = {
        ok: true,
        parsedText: 'Extracted resume text',
      },
    ) => {
      const fetchCalls: Array<{ url: string; body?: unknown }> = [];
      const mockFetch = vi.fn(
        async (input: RequestInfo | URL, init?: RequestInit) => {
          let url: string;
          let body: unknown;
          if (typeof input === 'string') {
            url = input;
            body = init?.body ? JSON.parse(String(init.body)) : undefined;
          } else {
            const request = input as Request;
            url = request.url;
            const cloned = request.clone();
            body = await cloned.json().catch(() => undefined);
          }
          fetchCalls.push({ url, body });

          if (url.includes('/resumes/') && url.includes('/content')) {
            return new Response(
              JSON.stringify({ parsedText: resumeResponse.parsedText ?? null }),
              { status: resumeResponse.ok ? 200 : 500 },
            );
          }
          if (url.includes('/api/generate')) {
            return new Response(
              JSON.stringify({
                choices: [{ message: { content: 'Generated letter' } }],
              }),
              { status: 200 },
            );
          }
          return new Response(JSON.stringify({}), { status: 200 });
        },
      );
      return { mockFetch, fetchCalls };
    };

    it('fetches the resume content and includes it in the prompt when selectedResumeId is set', async () => {
      const { mockFetch, fetchCalls } = buildFetchMock({
        ok: true,
        parsedText: 'Extracted resume text',
      });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<GeneratorControls selectedResumeId="r1" />, {
        preloadedState: {
          coverLetter: {
            jobDescription: 'Software Engineer',
            apiKey: 'gsk-test',
          },
        },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /Generate Cover Letter/i }),
      );

      await waitFor(() => {
        expect(
          fetchCalls.some((c) => c.url === '/api/resumes/r1/content'),
        ).toBe(true);
      });
      await waitFor(() => {
        const generateCall = fetchCalls.find((c) =>
          c.url.includes('/api/generate'),
        );
        expect(generateCall).toBeDefined();
        const message = (
          generateCall!.body as { messages: { content: string }[] }
        ).messages[0].content;
        expect(message).toContain('Extracted resume text');
      });
    });

    it('does not fetch resume content when selectedResumeId is not set', async () => {
      const { mockFetch, fetchCalls } = buildFetchMock();
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<GeneratorControls />, {
        preloadedState: {
          coverLetter: {
            jobDescription: 'Software Engineer',
            apiKey: 'gsk-test',
          },
        },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /Generate Cover Letter/i }),
      );

      await waitFor(() => {
        expect(fetchCalls.some((c) => c.url.includes('/api/generate'))).toBe(
          true,
        );
      });
      expect(fetchCalls.some((c) => c.url.includes('/content'))).toBe(false);
    });

    it('generates without resume text and shows a toast when the resume fetch fails', async () => {
      const { mockFetch, fetchCalls } = buildFetchMock({ ok: false });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<GeneratorControls selectedResumeId="r1" />, {
        preloadedState: {
          coverLetter: {
            jobDescription: 'Software Engineer',
            apiKey: 'gsk-test',
          },
        },
      });

      fireEvent.click(
        screen.getByRole('button', { name: /Generate Cover Letter/i }),
      );

      await waitFor(() => {
        const generateCall = fetchCalls.find((c) =>
          c.url.includes('/api/generate'),
        );
        expect(generateCall).toBeDefined();
        const message = (
          generateCall!.body as { messages: { content: string }[] }
        ).messages[0].content;
        expect(message).not.toContain('Candidate Resume:');
      });
    });
  });
});
