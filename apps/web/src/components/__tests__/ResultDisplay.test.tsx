import {
  renderWithProviders,
  screen,
  fireEvent,
  waitFor,
} from '../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResultDisplay from '../ResultDisplay';
import { generatePdf } from 'utils/downloadUtils';

vi.mock('utils/downloadUtils', () => ({
  generatePdf: vi.fn(),
  generateWord: vi.fn(),
}));

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({
  showToast: mockShowToast,
}));

describe('ResultDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null if there is no generated letter', () => {
    const { container } = renderWithProviders(<ResultDisplay />, {
      preloadedState: {
        coverLetter: {
          generatedLetter: '',
        },
      },
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders the generated letter if present', () => {
    const testLetter = 'Dear Hiring Manager, this is my cover letter.';
    renderWithProviders(<ResultDisplay />, {
      preloadedState: {
        coverLetter: {
          generatedLetter: testLetter,
        },
      },
    });
    expect(screen.getByText(/Dear Hiring Manager/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Designs/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Word/i })).toBeInTheDocument();
  });

  it('handles malicious content in the generated letter safely (it uses a textarea)', () => {
    const maliciousPayload = '<script>alert("xss")</script> **Bold Text**';
    renderWithProviders(<ResultDisplay />, {
      preloadedState: {
        coverLetter: {
          generatedLetter: maliciousPayload,
        },
      },
    });
    const editor = screen.getByDisplayValue(maliciousPayload);
    expect(editor).toBeInTheDocument();
    // Since it's in a textarea, it's rendered as plain text
    expect(screen.queryByTitle(/script/i)).not.toBeInTheDocument();
  });

  describe('Designs button', () => {
    const testLetter = 'Dear Hiring Manager, this is my cover letter.';

    it('prompts login and does not open the design picker when not authenticated', () => {
      const { store } = renderWithProviders(<ResultDisplay />, {
        preloadedState: {
          coverLetter: { generatedLetter: testLetter },
          auth: { isAuthenticated: false, isLoading: false },
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Designs/i }));

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('login'),
        expect.objectContaining({ type: 'info' }),
      );
      expect(store.getState().auth.isAuthModalOpen).toBe(true);
      expect(screen.queryByText('Choose a PDF Design')).not.toBeInTheDocument();
      expect(generatePdf).not.toHaveBeenCalled();
    });

    it('opens the design picker modal when authenticated', () => {
      renderWithProviders(<ResultDisplay />, {
        preloadedState: {
          coverLetter: { generatedLetter: testLetter },
          auth: { isAuthenticated: true, isLoading: false },
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Designs/i }));

      expect(screen.getByText('Choose a PDF Design')).toBeInTheDocument();
    });

    it('generates the PDF with the chosen design id, shows a success toast, and closes the modal', async () => {
      renderWithProviders(<ResultDisplay />, {
        preloadedState: {
          coverLetter: { generatedLetter: testLetter },
          auth: { isAuthenticated: true, isLoading: false },
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Designs/i }));
      fireEvent.click(screen.getByText('Minimal'));

      await waitFor(() => {
        expect(generatePdf).toHaveBeenCalledWith(
          testLetter,
          'Cover_Letter',
          'modern-minimal',
        );
      });
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('Minimal'),
          expect.objectContaining({ type: 'success' }),
        );
      });
      await waitFor(() => {
        expect(
          screen.queryByText('Choose a PDF Design'),
        ).not.toBeInTheDocument();
      });
    });

    it('keeps the modal open and shows an error toast if generation fails', async () => {
      vi.mocked(generatePdf).mockImplementationOnce(() => {
        throw new Error('boom');
      });

      renderWithProviders(<ResultDisplay />, {
        preloadedState: {
          coverLetter: { generatedLetter: testLetter },
          auth: { isAuthenticated: true, isLoading: false },
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Designs/i }));
      fireEvent.click(screen.getByText('Executive'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Failed to generate PDF. Please try again.',
          expect.objectContaining({ type: 'error' }),
        );
      });
      expect(screen.getByText('Choose a PDF Design')).toBeInTheDocument();
    });
  });
});
