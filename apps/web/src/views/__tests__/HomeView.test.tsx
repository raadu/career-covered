import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  renderWithProviders,
  screen,
  fireEvent,
  waitFor,
} from '../../../tests/test-utils';
import HomeView from 'views/HomeView';

vi.mock('utils/apiConfigUtils', () => ({
  GROQ_BASE_URL: 'http://localhost/api',
  API_ENDPOINTS: { CHAT_COMPLETIONS: '/generate' },
}));

describe('HomeView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('renders the template box, resume selector, job description, and generate button', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [] })),
    );
    renderWithProviders(<HomeView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
    });

    expect(screen.getByText('Your Cover Letter Template')).toBeInTheDocument();
    expect(screen.getByText('Your Resumes')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Generate Cover Letter/i }),
    ).toBeInTheDocument();
  });

  it('places the template box and resume selector in the same 70/30 grid row', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [] })),
    );
    renderWithProviders(<HomeView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
    });

    const templateHeading = screen.getByText('Your Cover Letter Template');
    const resumeHeading = screen.getByText('Your Resumes');
    const gridRow = document.querySelector('.lg\\:grid-cols-\\[7fr_3fr\\]');

    expect(gridRow).not.toBeNull();
    expect(gridRow?.contains(templateHeading)).toBe(true);
    expect(gridRow?.contains(resumeHeading)).toBe(true);
  });

  it('persists a resume selection made in the sidebar to localStorage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === '/api/resumes') {
          return {
            ok: true,
            json: async () => [
              {
                id: 'r1',
                name: 'My Resume',
                originalFileName: 'r.pdf',
                mimeType: 'application/pdf',
                fileSize: 100,
                order: 0,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { ok: true, json: async () => [] };
      }),
    );
    renderWithProviders(<HomeView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });

    await waitFor(() => screen.getByText('My Resume'));
    fireEvent.click(screen.getByText('My Resume'));

    expect(localStorage.getItem('cl_selected_resume_id')).toBe('"r1"');
  });

  it('feeds the measured Template box height to the resume panel as a CSS variable, even with resumes listed', async () => {
    let capturedCallback: ResizeObserverCallback | null = null;
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        capturedCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    const originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url === '/api/resumes') {
          return {
            ok: true,
            json: async () => [
              {
                id: 'r1',
                name: 'My Resume',
                originalFileName: 'r.pdf',
                mimeType: 'application/pdf',
                fileSize: 100,
                order: 0,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { ok: true, json: async () => [] };
      }),
    );
    renderWithProviders(<HomeView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });

    await waitFor(() => screen.getByText('My Resume'));

    act(() => {
      capturedCallback?.(
        [{ contentRect: { height: 180 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });

    await waitFor(() => {
      const panel = screen
        .getByText('Your Resumes')
        .closest('div[style]') as HTMLElement;
      expect(panel.style.getPropertyValue('--template-height')).toBe('180px');
    });

    globalThis.ResizeObserver = originalResizeObserver;
  });
});
