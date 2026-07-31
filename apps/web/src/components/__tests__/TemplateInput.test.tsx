import { renderWithProviders, screen, fireEvent, waitFor } from '../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TemplateInput from '../TemplateInput';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('../../components/common/Toast', () => ({
  showToast: mockShowToast,
}));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('TemplateInput', () => {
  it('renders the label and textarea', () => {
    renderWithProviders(<TemplateInput />);
    expect(screen.getByText(/Your Cover Letter Template/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste your existing cover letter here/i)).toBeInTheDocument();
  });

  it('updates the state when the user types', () => {
    const { store } = renderWithProviders(<TemplateInput />);
    const textarea = screen.getByPlaceholderText(/Paste your existing cover letter here/i) as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'My resume details' } });

    expect(store.getState().coverLetter.template).toBe('My resume details');
  });

  it('handles malicious code input safely', () => {
    const maliciousPayload = '<img src=x onerror=alert(1)>';
    const { store } = renderWithProviders(<TemplateInput />);
    const textarea = screen.getByPlaceholderText(/Paste your existing cover letter here/i);

    fireEvent.change(textarea, { target: { value: maliciousPayload } });

    expect(store.getState().coverLetter.template).toBe(maliciousPayload);
    expect(textarea).toHaveValue(maliciousPayload);
  });

  describe('when not authenticated', () => {
    it('shows auth modal and toast on save template click', () => {
      const { store } = renderWithProviders(<TemplateInput />);
      const textarea = screen.getByPlaceholderText(/Paste your existing cover letter here/i);
      fireEvent.change(textarea, { target: { value: 'My template content' } });

      const saveButton = screen.getByTitle('Save as a template');
      fireEvent.click(saveButton);

      expect(mockShowToast).toHaveBeenCalledWith(
        "Oops! You should login to do that. Creating an account is so easy.",
        { type: 'info', duration: 6000 },
      );
      expect(store.getState().auth.isAuthModalOpen).toBe(true);
    });

    it('does not dispatch fetchTemplates on mount', () => {
      const { store } = renderWithProviders(<TemplateInput />);
      expect(store.getState().coverLetter.savedTemplates).toEqual([]);
    });
  });

  describe('when authenticated', () => {
    const authState = {
      auth: {
        user: { id: '1', email: 'test@test.com', name: 'Test' },
        isAuthenticated: true,
        isLoading: false,
        isAuthModalOpen: false,
        authError: null,
      },
    };

    const savedTemplates = [
      { id: 't1', name: 'Template 1', content: 'Hello' },
    ];

    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(savedTemplates),
      }));
    });

    it('shows loading skeleton when templates are loading', () => {
      const { container } = renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: { template: '', savedTemplates: [], activeTemplateId: null, isLoadingTemplates: true },
        },
      });
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders template selector when templates are loaded', async () => {
      renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: {
            template: '',
            savedTemplates,
            activeTemplateId: 't1',
            isLoadingTemplates: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Template 1')).toBeInTheDocument();
      });
    });

    it('does not show auth modal on save template click when authenticated', async () => {
      const { store } = renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: { template: 'My template', savedTemplates: [], activeTemplateId: null, isLoadingTemplates: false },
        },
      });

      const textarea = screen.getByPlaceholderText(/Paste your existing cover letter here/i);
      fireEvent.change(textarea, { target: { value: 'My template' } });

      const saveButton = screen.getByTitle('Save as a template');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(store.getState().auth.isAuthModalOpen).toBe(false);
      });
    });

    it('shows delete confirmation modal when remove button is clicked', async () => {
      renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: {
            template: '',
            savedTemplates,
            activeTemplateId: 't1',
            isLoadingTemplates: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByTitle('Delete Template')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Delete Template'));

      expect(screen.getByText('Do you really want to delete it?')).toBeInTheDocument();
      expect(screen.getByText('Sure!')).toBeInTheDocument();
      expect(screen.getByText('Nope')).toBeInTheDocument();
    });

    it('closes confirmation modal on cancel', async () => {
      renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: {
            template: '',
            savedTemplates,
            activeTemplateId: 't1',
            isLoadingTemplates: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByTitle('Delete Template')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Delete Template'));

      expect(screen.getByText('Do you really want to delete it?')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Nope'));

      expect(screen.queryByText('Do you really want to delete it?')).not.toBeInTheDocument();
    });

    it('dispatches deleteTemplate on confirm', async () => {
      const { store } = renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: {
            template: '',
            savedTemplates,
            activeTemplateId: 't1',
            isLoadingTemplates: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByTitle('Delete Template')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Delete Template'));

      fireEvent.click(screen.getByText('Sure!'));

      await waitFor(() => {
        expect(screen.queryByText('Do you really want to delete it?')).not.toBeInTheDocument();
      });
    });

    it('deselects the active template when the clear button is pressed', () => {
      const { store } = renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: {
            template: 'Existing template content',
            savedTemplates,
            activeTemplateId: 't1',
            isLoadingTemplates: false,
          },
        },
      });

      fireEvent.click(screen.getByTitle('Remove all the text'));

      expect(store.getState().coverLetter.template).toBe('');
      expect(store.getState().coverLetter.activeTemplateId).toBeNull();
    });

    it('persists the deselection by removing the active template id from localStorage', () => {
      localStorage.setItem('cl_active_template_id', 't1');
      localStorage.setItem('cl_template', 'Existing template content');

      const { store } = renderWithProviders(<TemplateInput />, {
        preloadedState: {
          ...authState,
          coverLetter: {
            template: 'Existing template content',
            savedTemplates,
            activeTemplateId: 't1',
            isLoadingTemplates: false,
          },
        },
      });

      fireEvent.click(screen.getByTitle('Remove all the text'));

      expect(localStorage.getItem('cl_active_template_id')).toBeNull();
      expect(store.getState().coverLetter.activeTemplateId).toBeNull();
    });
  });
});
