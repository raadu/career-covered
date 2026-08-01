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

    expect(screen.getByTitle('Sign In')).toBeInTheDocument();
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
