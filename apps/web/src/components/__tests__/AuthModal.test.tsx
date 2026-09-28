import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes, useLocation } from 'react-router-dom';
import AuthModal from '../Modals/AuthModal';
import { setAuthModalOpen } from 'store/authSlice';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('../common/Toast', () => ({
  showToast: mockShowToast,
}));

const mockDispatch = vi.hoisted(() =>
  vi.fn(() => ({ unwrap: () => Promise.resolve() })),
);
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

const openState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthModalOpen: true,
    authError: null,
  },
};

// jsdom's window.location can't be reassigned directly; stub it via
// defineProperty and return a restore function for the test to call.
function mockWindowLocation() {
  const original = window.location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...original, href: '' },
  });
  return () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: original,
    });
  };
}

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('does not render when modal is closed', () => {
    const { container } = renderWithProviders(<AuthModal />, {
      preloadedState: {
        auth: { ...openState.auth, isAuthModalOpen: false },
      },
    });
    expect(container.firstChild).toBeNull();
  });

  it('renders sign in form when modal is open', () => {
    renderWithProviders(<AuthModal />, { preloadedState: openState });

    expect(screen.getAllByText('Sign in').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('switches to register form', () => {
    renderWithProviders(<AuthModal />, { preloadedState: openState });

    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getAllByText('Create account').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
  });

  it('redirects to Google OAuth on Google button click', () => {
    const restoreLocation = mockWindowLocation();

    renderWithProviders(<AuthModal />, { preloadedState: openState });

    fireEvent.click(screen.getByText('Continue with Google'));
    expect(window.location.href).toBe('/auth/google');

    restoreLocation();
  });

  it('saves coverLetter state to sessionStorage before Google redirect', () => {
    const restoreLocation = mockWindowLocation();

    renderWithProviders(<AuthModal />, {
      preloadedState: {
        auth: { ...openState.auth },
        coverLetter: {
          jobDescription: 'Software engineer position',
          generatedLetter: 'Dear hiring manager, I am writing...',
        },
      },
    });

    fireEvent.click(screen.getByText('Continue with Google'));

    expect(sessionStorage.getItem('cl_restore_jd')).toBe(
      'Software engineer position',
    );
    expect(sessionStorage.getItem('cl_restore_gl')).toBe(
      'Dear hiring manager, I am writing...',
    );
    expect(sessionStorage.getItem('google_oauth_redirect')).toBe('true');

    restoreLocation();
  });

  it('does not save empty jobDescription or generatedLetter to sessionStorage', () => {
    const restoreLocation = mockWindowLocation();

    renderWithProviders(<AuthModal />, {
      preloadedState: {
        auth: { ...openState.auth },
        coverLetter: {
          jobDescription: '',
          generatedLetter: '',
        },
      },
    });

    fireEvent.click(screen.getByText('Continue with Google'));

    expect(sessionStorage.getItem('cl_restore_jd')).toBeNull();
    expect(sessionStorage.getItem('cl_restore_gl')).toBeNull();
    expect(sessionStorage.getItem('google_oauth_redirect')).toBe('true');

    restoreLocation();
  });

  it('shows validation errors for empty fields', () => {
    renderWithProviders(<AuthModal />, { preloadedState: openState });

    fireEvent.click(screen.getAllByText('Sign in')[1]);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows password validation error for weak password on register', () => {
    renderWithProviders(<AuthModal />, { preloadedState: openState });

    fireEvent.click(screen.getByText('Sign up'));

    fireEvent.change(screen.getByPlaceholderText('Full name'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'weak' },
    });

    fireEvent.click(screen.getAllByText('Create account')[1]);

    expect(
      screen.getByText(
        'Password should have minimum 8 characters, 1 capital letter and 1 number.',
      ),
    ).toBeInTheDocument();
  });

  it('shows forgot password link when in sign in mode', () => {
    renderWithProviders(<AuthModal />, { preloadedState: openState });

    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  describe('forgot password', () => {
    const LocationProbe = () => (
      <span data-testid="location">{useLocation().pathname}</span>
    );

    const renderAndOpenForgot = () => {
      renderWithProviders(
        <>
          <AuthModal />
          <Routes>
            <Route path="*" element={<LocationProbe />} />
          </Routes>
        </>,
        { preloadedState: openState },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    };

    it('is not shown on the sign-up form', () => {
      renderWithProviders(<AuthModal />, { preloadedState: openState });
      fireEvent.click(screen.getByText('Sign up'));
      expect(
        screen.queryByRole('button', { name: 'Forgot password?' }),
      ).not.toBeInTheDocument();
    });

    it('switches the modal to a forgot-password screen instead of leaving the page', () => {
      renderAndOpenForgot();

      expect(
        screen.getByRole('heading', { name: 'Forgot your password?' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/aren't automated yet/)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
      expect(screen.getByTestId('location')).toHaveTextContent('/');
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('goes back to the sign-in form, keeping the typed email', () => {
      renderWithProviders(<AuthModal />, { preloadedState: openState });
      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'me@test.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
      fireEvent.click(screen.getByRole('button', { name: /Back to sign in/ }));

      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toHaveValue(
        'me@test.com',
      );
    });

    it('Contact Support closes the modal and opens the Support page', () => {
      renderAndOpenForgot();
      fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }));

      expect(mockDispatch).toHaveBeenCalledWith(setAuthModalOpen(false));
      expect(screen.getByTestId('location')).toHaveTextContent('/support');
    });

    it('clears any previous error when opened', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        }),
      );
      renderWithProviders(<AuthModal />, { preloadedState: openState });
      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'me@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Wrong123' },
      });
      fireEvent.click(screen.getAllByText('Sign in')[1]);
      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
      fireEvent.click(screen.getByRole('button', { name: /Back to sign in/ }));
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      vi.unstubAllGlobals();
    });
  });

  describe('API interactions', () => {
    it('handles 409 conflict on register', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Conflict' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<AuthModal />, { preloadedState: openState });

      fireEvent.click(screen.getByText('Sign up'));
      fireEvent.change(screen.getByPlaceholderText('Full name'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Strong123' },
      });
      fireEvent.click(screen.getAllByText('Create account')[1]);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Your email already exists. Let's log into your account!",
          { type: 'info' },
        );
      });

      expect(screen.getAllByText('Sign in').length).toBeGreaterThanOrEqual(1);
      vi.unstubAllGlobals();
    });

    it('handles 404 on login', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<AuthModal />, { preloadedState: openState });

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Strong123' },
      });
      fireEvent.click(screen.getAllByText('Sign in')[1]);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "You're not registered yet. Let's get you onboarded!",
          { type: 'info', duration: 5000 },
        );
      });

      expect(
        screen.getAllByText('Create account').length,
      ).toBeGreaterThanOrEqual(1);
      vi.unstubAllGlobals();
    });

    it('shows the server-provided friendly message when rate limited (429), without switching modes', async () => {
      const friendly =
        "You're going a little too fast. Please wait a minute and try again.";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ statusCode: 429, message: friendly }),
      });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<AuthModal />, { preloadedState: openState });

      fireEvent.click(screen.getByText('Sign up'));
      fireEvent.change(screen.getByPlaceholderText('Full name'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Strong123' },
      });
      fireEvent.click(screen.getAllByText('Create account')[1]);

      expect(await screen.findByText(friendly)).toBeInTheDocument();
      expect(screen.queryByText(/ThrottlerException/)).not.toBeInTheDocument();
      expect(mockShowToast).not.toHaveBeenCalled();
      expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
      vi.unstubAllGlobals();
    });

    it('shows success toast and dispatches setUser on successful sign in', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ id: '1', email: 'test@test.com', name: 'Test' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<AuthModal />, { preloadedState: openState });

      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Strong123' },
      });
      fireEvent.click(screen.getAllByText('Sign in')[1]);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Welcome! Let's be serious about your job hunt \uD83D\uDE20",
          { type: 'success', duration: 3000 },
        );
      });

      expect(mockDispatch).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('shows register success toast on successful register', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({ id: '1', email: 'test@test.com', name: 'Test' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      renderWithProviders(<AuthModal />, { preloadedState: openState });

      fireEvent.click(screen.getByText('Sign up'));
      fireEvent.change(screen.getByPlaceholderText('Full name'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email address'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Strong123' },
      });
      fireEvent.click(screen.getAllByText('Create account')[1]);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          "Awesome! You're now registered.",
          { type: 'success', duration: 3000 },
        );
      });

      expect(mockDispatch).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });
  });
});
