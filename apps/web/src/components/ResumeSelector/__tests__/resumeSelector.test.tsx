import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  screen,
  fireEvent,
  waitFor,
  renderWithProviders,
} from '../../../../tests/test-utils';
import ResumeSelector from 'components/ResumeSelector/index';
import type { Resume } from 'views/ResumeView/types';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({ showToast: mockShowToast }));

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'My Resume',
  originalFileName: 'my-resume.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
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

describe('ResumeSelector', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
  });

  const stubFetch = (impl: (...args: Parameters<typeof fetch>) => unknown) => {
    vi.stubGlobal('fetch', vi.fn(impl));
  };

  it('renders the header and subtitle', () => {
    stubFetch(async () => ({ ok: true, json: async () => [] }));
    renderWithProviders(
      <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
      {
        preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
      },
    );
    expect(screen.getByText('Your Resumes')).toBeInTheDocument();
    expect(
      screen.getByText('Select your resume to create better cover letter'),
    ).toBeInTheDocument();
  });

  describe('when unauthenticated', () => {
    it('shows a login tile instead of fetching resumes', () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: {
            auth: { isAuthenticated: false, isLoading: false },
          },
        },
      );

      expect(screen.getByText('Login to add resume')).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('renders the login tile with compact height', () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: {
            auth: { isAuthenticated: false, isLoading: false },
          },
        },
      );

      expect(screen.getByText('Login to add resume').closest('button')).toHaveClass(
        'py-0.5',
      );
    });

    it('opens the auth modal when the login tile is clicked', () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      const { store } = renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: {
            auth: { isAuthenticated: false, isLoading: false },
          },
        },
      );

      fireEvent.click(screen.getByText('Login to add resume'));

      expect(store.getState().auth.isAuthModalOpen).toBe(true);
    });
  });

  describe('when authenticated', () => {
    it('lists resumes and shows the empty-state upload label', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/resumes'));
      expect(screen.getByText('Upload Resume')).toBeInTheDocument();
    });

    it('shows "Upload More Resumes" once at least one resume exists', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [mockResume()] }));
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => screen.getByText('My Resume'));
      expect(screen.getByText('Upload More Resumes')).toBeInTheDocument();
    });

    it('calls onSelectResume when a row is clicked', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [mockResume()] }));
      const onSelectResume = vi.fn();
      renderWithProviders(
        <ResumeSelector
          selectedResumeId={null}
          onSelectResume={onSelectResume}
        />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByText('My Resume'));

      expect(onSelectResume).toHaveBeenCalledWith('r1');
    });

    it('opens the preview modal from the row eye icon', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [mockResume()] }));
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => screen.getByText('My Resume'));
      fireEvent.click(screen.getByTitle('Preview'));

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('src', '/api/resumes/r1/preview');
    });

    it('uploads the selected file via the trailing upload tile', async () => {
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
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => expect(calls).toContain('GET /api/resumes'));
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [pdfFile()] } });

      await waitFor(() => {
        expect(calls.filter((c) => c === 'POST /api/resumes')).toHaveLength(1);
      });
    });

    it('shows the max-resumes toast when uploading at the 8-resume cap', async () => {
      const eight = Array.from({ length: 8 }, (_, i) =>
        mockResume({ id: `r${i}`, name: `Resume ${i}`, order: i }),
      );
      stubFetch(async () => ({ ok: true, json: async () => eight }));
      renderWithProviders(
        <ResumeSelector selectedResumeId={null} onSelectResume={vi.fn()} />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => screen.getByText('Resume 0'));
      fireEvent.click(screen.getByText('Upload More Resumes'));

      expect(mockShowToast).toHaveBeenCalledWith(
        'You can only upload maximum 8 resumes. Please delete one resume to upload.',
        expect.objectContaining({ type: 'error', duration: 4000 }),
      );
    });

    it('applies the measured height as a CSS variable with resumes present', async () => {
      stubFetch(async () => ({ ok: true, json: async () => [mockResume()] }));
      const { container } = renderWithProviders(
        <ResumeSelector
          selectedResumeId={null}
          onSelectResume={vi.fn()}
          maxHeight={240}
        />,
        {
          preloadedState: { auth: { isAuthenticated: true, isLoading: false } },
        },
      );

      await waitFor(() => screen.getByText('My Resume'));

      const panel = container.firstChild as HTMLElement;
      expect(panel.style.getPropertyValue('--template-height')).toBe(
        '240px',
      );
    });
  });

  describe('height matching', () => {
    it('applies the measured height as a CSS variable', () => {
      const { container } = renderWithProviders(
        <ResumeSelector
          selectedResumeId={null}
          onSelectResume={vi.fn()}
          maxHeight={240}
        />,
        {
          preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
        },
      );

      const panel = container.firstChild as HTMLElement;
      expect(panel.style.getPropertyValue('--template-height')).toBe(
        '240px',
      );
    });

    it('leaves the CSS variable unset when maxHeight has not been measured yet', () => {
      stubFetch(async () => ({ ok: true, json: async () => [] }));
      const { container } = renderWithProviders(
        <ResumeSelector
          selectedResumeId={null}
          onSelectResume={vi.fn()}
          maxHeight={null}
        />,
        {
          preloadedState: { auth: { isAuthenticated: false, isLoading: false } },
        },
      );

      const panel = container.firstChild as HTMLElement;
      expect(panel.style.getPropertyValue('--template-height')).toBe('');
    });
  });
});
