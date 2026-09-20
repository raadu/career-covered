import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditLinksModal from '..';

const baseUser = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
  linkedinUrl: 'https://linkedin.com/in/existing',
  githubUrl: 'https://github.com/existing',
  websiteUrl: 'https://existing.dev',
  contactEmail: 'existing@example.com',
};

const authState = (overrides = {}) => ({
  user: baseUser,
  isAuthenticated: true,
  isLoading: false,
  isAuthModalOpen: false,
  authError: null,
  ...overrides,
});

describe('EditLinksModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows explanatory helper text describing what the modal is for', () => {
    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    expect(
      screen.getByText(
        'Add links of your LinkedIn, portfolio website, GitHub and email so you can quickly copy from here and then paste in the job application form.',
      ),
    ).toBeInTheDocument();
  });

  it('pre-populates all 4 fields from the current user', () => {
    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    expect(screen.getByPlaceholderText('LinkedIn URL')).toHaveValue(
      'https://linkedin.com/in/existing',
    );
    expect(screen.getByPlaceholderText('GitHub URL')).toHaveValue(
      'https://github.com/existing',
    );
    expect(screen.getByPlaceholderText('Website URL')).toHaveValue(
      'https://existing.dev',
    );
    expect(screen.getByPlaceholderText('Contact email')).toHaveValue(
      'existing@example.com',
    );
  });

  it('sends all 4 current field values on save, including untouched ones', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => baseUser,
    }));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    fireEvent.change(screen.getByPlaceholderText('LinkedIn URL'), {
      target: { value: 'https://linkedin.com/in/new' },
    });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/profile/links',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          linkedinUrl: 'https://linkedin.com/in/new',
          githubUrl: 'https://github.com/existing',
          websiteUrl: 'https://existing.dev',
          contactEmail: 'existing@example.com',
        }),
      }),
    );
  });

  it('sends an empty string for a field the user clears', async () => {
    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(async () => ({ ok: true, json: async () => baseUser }) as Response);
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    fireEvent.change(screen.getByPlaceholderText('GitHub URL'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    const call = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(call.body as string).githubUrl).toBe('');
  });

  it('shows an error banner and keeps the modal open when the save fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false })),
    );

    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() =>
      expect(
        screen.getByText('Failed to update profile links'),
      ).toBeInTheDocument(),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose without saving when the overlay is clicked', () => {
    vi.stubGlobal('fetch', vi.fn());
    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    fireEvent.click(screen.getByRole('dialog').parentElement!);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls onClose without saving when the close button is clicked', () => {
    vi.stubGlobal('fetch', vi.fn());
    renderWithProviders(<EditLinksModal isOpen onClose={onClose} />, {
      preloadedState: { auth: authState() },
    });

    fireEvent.click(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });
});
