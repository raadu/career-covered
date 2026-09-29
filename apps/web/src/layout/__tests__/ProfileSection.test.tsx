import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileSection from '../Sidebar/ProfileSection';

const mockLogout = vi.fn();
vi.mock('store/authSlice', async () => {
  const actual = await vi.importActual('store/authSlice');
  return {
    ...actual,
    logoutUser: () => mockLogout,
  };
});

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Sign In button when not authenticated', () => {
    renderWithProviders(<ProfileSection isExpanded={true} />, {
      preloadedState: {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthModalOpen: false,
          authError: null,
        },
      },
    });

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('opens the auth modal when Sign In is clicked', () => {
    const { store } = renderWithProviders(
      <ProfileSection isExpanded={true} />,
      {
        preloadedState: {
          auth: { user: null, isAuthenticated: false, isLoading: false },
        },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(store.getState().auth.isAuthModalOpen).toBe(true);
  });

  it('dispatches logout only after the sign-out is confirmed', () => {
    mockLogout.mockReturnValue({ unwrap: () => Promise.resolve() });
    renderWithProviders(<ProfileSection isExpanded={true} />, {
      preloadedState: {
        auth: {
          user: { id: '1', email: 'test@test.com', name: 'Test User' },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    const [, signOutButton] = screen.getAllByRole('button', {
      name: 'Sign Out',
    });
    fireEvent.click(signOutButton);
    expect(mockLogout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sure!' }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('renders user avatar when authenticated', () => {
    renderWithProviders(<ProfileSection isExpanded={true} />, {
      preloadedState: {
        auth: {
          user: { id: '1', email: 'test@test.com', name: 'Test User' },
          isAuthenticated: true,
          isLoading: false,
          isAuthModalOpen: false,
          authError: null,
        },
      },
    });

    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it.each([
    ['name', 'A Very Long Display Name That Truncates'],
    ['email', 'a.very.long.address.that.truncates@example-domain.com'],
  ])('shows the full %s in a tooltip on hover', (_field, text) => {
    renderWithProviders(<ProfileSection isExpanded={true} />, {
      preloadedState: {
        auth: {
          user: {
            id: '1',
            name: 'A Very Long Display Name That Truncates',
            email: 'a.very.long.address.that.truncates@example-domain.com',
          },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    const line = screen.getByText(text, { selector: 'p' });
    expect(line).toHaveClass('truncate');
    fireEvent.mouseEnter(line.parentElement!);
    expect(screen.getByRole('tooltip')).toHaveTextContent(text);

    fireEvent.mouseLeave(line.parentElement!);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show name/email when collapsed', () => {
    renderWithProviders(<ProfileSection isExpanded={false} />, {
      preloadedState: {
        auth: {
          user: { id: '1', email: 'test@test.com', name: 'Test User' },
          isAuthenticated: true,
          isLoading: false,
          isAuthModalOpen: false,
          authError: null,
        },
      },
    });

    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    expect(screen.queryByText('test@test.com')).not.toBeInTheDocument();
  });

  it('shows ConfirmModal when avatar is clicked', () => {
    renderWithProviders(<ProfileSection isExpanded={false} />, {
      preloadedState: {
        auth: {
          user: { id: '1', email: 'test@test.com', name: 'Test User' },
          isAuthenticated: true,
          isLoading: false,
          isAuthModalOpen: false,
          authError: null,
        },
      },
    });

    fireEvent.click(screen.getByText('T'));
    expect(
      screen.getByText('Are you sure you want to sign out?'),
    ).toBeInTheDocument();
  });
});
