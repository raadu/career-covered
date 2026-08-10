import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  screen,
  fireEvent,
  waitFor,
  renderWithProviders,
} from '../../../../tests/test-utils';
import ResumeView from 'views/ResumeView/index';
import type { Resume } from 'views/ResumeView/types';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({
  showToast: mockShowToast,
}));

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'My Resume',
  originalFileName: 'my-resume.pdf',
  mimeType: 'application/pdf',
  fileSize: 102_400,
  order: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const pdfFile = (name = 'resume.pdf', size = 1024) => {
  const file = new File(['%PDF-1.4'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('ResumeView', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
    localStorage.clear();
  });

  const stubFetch = (impl: (...args: Parameters<typeof fetch>) => unknown) => {
    vi.stubGlobal('fetch', vi.fn(impl));
  };

  it('renders nothing while auth is loading', () => {
    const { container } = renderWithProviders(<ResumeView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: true } },
    });
    expect(container.firstChild).toBeNull();
  });

  it('redirects (renders nothing) when not authenticated', () => {
    const { container } = renderWithProviders(<ResumeView />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders the title and subtitle for an authenticated user', async () => {
    stubFetch(async () => ({ ok: true, json: async () => [] }));
    renderWithProviders(<ResumeView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });

    expect(screen.getByText('Resumes')).toBeInTheDocument();
    expect(
      screen.getByText('Upload and manage your resumes here'),
    ).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/resumes'));
  });

  it('renders a card for each resume returned by the API', async () => {
    stubFetch(async () => ({
      ok: true,
      json: async () => [mockResume({ id: 'r1', name: 'Resume One' })],
    }));
    renderWithProviders(<ResumeView />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
    });

    await waitFor(() => {
      expect(screen.getByText('Resume One')).toBeInTheDocument();
    });
  });

  describe('upload', () => {
    it('uploads the selected file and refetches the list', async () => {
      const calls: string[] = [];
      stubFetch(async (input, init) => {
        const url = String(input);
        calls.push(`${init?.method ?? 'GET'} ${url}`);
        if (url === '/api/resumes' && (!init || init.method === undefined)) {
          return { ok: true, json: async () => [] };
        }
        if (url === '/api/resumes' && init?.method === 'POST') {
          return { ok: true, json: async () => mockResume() };
        }
        return { ok: true, json: async () => [] };
      });

      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => expect(calls).toContain('GET /api/resumes'));

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [pdfFile()] } });

      await waitFor(() => {
        expect(calls.filter((c) => c === 'POST /api/resumes')).toHaveLength(1);
      });
      const [, init] = vi
        .mocked(fetch)
        .mock.calls.find(([, i]) => i?.method === 'POST')!;
      expect(init?.body).toBeInstanceOf(FormData);
    });

    it('rejects a non-PDF file client-side without calling the API', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });
      await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/resumes'));
      vi.mocked(fetch).mockClear();

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const notAPdf = new File(['hello'], 'notes.txt', { type: 'text/plain' });
      fireEvent.change(input, { target: { files: [notAPdf] } });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Only PDF files are supported',
          expect.objectContaining({ type: 'error' }),
        );
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('keeps the upload slot enabled once 8 resumes exist, but shows an error toast on click instead of opening the file picker', async () => {
      const eight = Array.from({ length: 8 }, (_, i) =>
        mockResume({ id: `r${i}`, name: `Resume ${i}`, order: i }),
      );
      stubFetch(async () => ({ ok: true, json: async () => eight }));
      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => {
        expect(screen.getByText('Resume 0')).toBeInTheDocument();
      });
      const uploadSlot = screen.getByTitle('You can have up to 8 resumes');
      expect(uploadSlot).not.toBeDisabled();

      fireEvent.click(uploadSlot);

      expect(mockShowToast).toHaveBeenCalledWith(
        'You can only upload maximum 8 resumes. Please delete one resume to upload.',
        expect.objectContaining({ type: 'error', duration: 4000 }),
      );
      expect(fetch).not.toHaveBeenCalledWith(
        '/api/resumes',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('rename', () => {
    it('sends a PATCH request with the new name on commit', async () => {
      const calls: Array<{ url: string; init?: RequestInit }> = [];
      stubFetch(async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url === '/api/resumes' && !init) {
          return { ok: true, json: async () => [mockResume()] };
        }
        return { ok: true, json: async () => ({}) };
      });

      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByText('My Resume'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Renamed' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(
          calls.some(
            (c) => c.url === '/api/resumes/r1' && c.init?.method === 'PATCH',
          ),
        ).toBe(true);
      });
    });
  });

  describe('preview', () => {
    it('opens the preview modal with an iframe pointed at the preview endpoint', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [mockResume()] }));
      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByTitle('View'));

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('src', '/api/resumes/r1/preview');
    });
  });

  describe('replace', () => {
    it('uploads the replacement file to the replace endpoint', async () => {
      const calls: Array<{ url: string; init?: RequestInit }> = [];
      stubFetch(async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url === '/api/resumes' && !init) {
          return { ok: true, json: async () => [mockResume()] };
        }
        return { ok: true, json: async () => mockResume() };
      });

      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByTitle('Replace file'));
      const fileInputs = document.querySelectorAll('input[type="file"]');
      // Index 1: slot 0 is the upload-slot's own hidden input.
      fireEvent.change(fileInputs[1], { target: { files: [pdfFile()] } });

      await waitFor(() => {
        expect(
          calls.some(
            (c) =>
              c.url === '/api/resumes/r1/replace' && c.init?.method === 'POST',
          ),
        ).toBe(true);
      });
    });
  });

  describe('delete', () => {
    it('shows a confirm modal, then deletes on confirm', async () => {
      const calls: Array<{ url: string; init?: RequestInit }> = [];
      stubFetch(async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url === '/api/resumes' && !init) {
          return { ok: true, json: async () => [mockResume()] };
        }
        return { ok: true, json: async () => ({}) };
      });

      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByTitle('Delete'));

      expect(screen.getByText('Delete resume')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Sure!'));

      await waitFor(() => {
        expect(
          calls.some(
            (c) => c.url === '/api/resumes/r1' && c.init?.method === 'DELETE',
          ),
        ).toBe(true);
      });
    });

    it('does not delete when the confirm modal is cancelled', async () => {
      const calls: Array<{ url: string; init?: RequestInit }> = [];
      stubFetch(async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        return { ok: true, json: async () => [mockResume()] };
      });

      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByTitle('Delete'));
      fireEvent.click(screen.getByText('Nope'));

      expect(calls.some((c) => c.init?.method === 'DELETE')).toBe(false);
    });
  });

  describe('view mode toggle', () => {
    it('defaults to grid view', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });

      await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/resumes'));
      expect(screen.getByTitle('Upload a resume')).toBeInTheDocument();
      expect(screen.queryByText('Name')).not.toBeInTheDocument();
    });

    it('switches to the table when List View is clicked', async () => {
      stubFetch(async () => ({
        ok: true,
        json: async () => [mockResume()],
      }));
      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });
      await waitFor(() => screen.getByText('My Resume'));

      fireEvent.click(screen.getByTitle('List View'));

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.queryByTitle('Upload a resume')).not.toBeInTheDocument();
    });

    it('persists the chosen view across a remount', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      const { unmount } = renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });
      await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/resumes'));
      fireEvent.click(screen.getByTitle('List View'));
      expect(screen.getByText('Name')).toBeInTheDocument();
      unmount();

      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });
      await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/resumes'));
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('shows the header Upload Resume button in list view and toasts at the 8-resume cap', async () => {
      const eight = Array.from({ length: 8 }, (_, i) =>
        mockResume({ id: `r${i}`, name: `Resume ${i}`, order: i }),
      );
      stubFetch(async () => ({ ok: true, json: async () => eight }));
      renderWithProviders(<ResumeView />, {
        preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
      });
      await waitFor(() => screen.getByText('Resume 0'));
      fireEvent.click(screen.getByTitle('List View'));

      fireEvent.click(screen.getByText('Upload Resume'));

      expect(mockShowToast).toHaveBeenCalledWith(
        'You can only upload maximum 8 resumes. Please delete one resume to upload.',
        expect.objectContaining({ type: 'error', duration: 4000 }),
      );
    });
  });
});
