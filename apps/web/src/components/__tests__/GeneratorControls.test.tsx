import { renderWithProviders, screen, fireEvent, waitFor } from '../../../tests/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GeneratorControls from '../GeneratorControls';
import { DEFAULT_MODEL } from 'utils/AIModelUtils';

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
        expect(screen.getByRole('button', { name: /Add Custom API Key/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Cover Letter/i })).toBeInTheDocument();
    });

    it('does not render the AI model selector dropdown', () => {
        renderWithProviders(<GeneratorControls />);
        expect(screen.queryByLabelText(/AI Model/i)).not.toBeInTheDocument();
    });

    it('disables the generate button if job description is missing', () => {
        renderWithProviders(<GeneratorControls />, {
            preloadedState: {
                coverLetter: {
                    jobDescription: '',
                    apiKey: 'valid-key'
                }
            }
        });
        const button = screen.getByRole('button', { name: /Generate Cover Letter/i });
        expect(button).toBeDisabled();
    });

    it('enables the generate button if job description and API key are present', () => {
        renderWithProviders(<GeneratorControls />, {
            preloadedState: {
                coverLetter: {
                    jobDescription: 'Software Engineer',
                    apiKey: 'valid-key'
                }
            }
        });
        const button = screen.getByRole('button', { name: /Generate Cover Letter/i });
        expect(button).toBeEnabled();
    });

    it('enables the generate button if job description is present and using free generations (no key)', () => {
        renderWithProviders(<GeneratorControls />, {
            preloadedState: {
                coverLetter: {
                    jobDescription: 'Software Engineer',
                    apiKey: '',
                    generationCount: 1
                }
            }
        });
        const button = screen.getByRole('button', { name: /Generate Cover Letter/i });
        expect(button).toBeEnabled();
    });

    it('generates using the default Llama 3.3 70B model and saves with the same model', async () => {
        type FetchCall = { url: string; method: string; body: unknown };
        const fetchCalls: FetchCall[] = [];
        const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
        });
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
                    call.url.includes('/api/cover-letters') &&
                    call.method === 'POST',
            );
            expect(saveCall).toBeDefined();
            expect(saveCall?.body).toMatchObject({ model: DEFAULT_MODEL });
        });
    });
});
