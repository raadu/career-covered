import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../../tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuickLinks from '..';

const mockHandleCopy = vi.fn();
vi.mock('hooks/useCopy', () => ({
  useCopy: () => ({ copied: false, handleCopy: mockHandleCopy }),
}));

const baseUser = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
};

const authState = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthModalOpen: false,
  authError: null,
  ...overrides,
});

const LINK_NAMES = [
  'Copy LinkedIn Link',
  'Copy GitHub Link',
  'Copy Website Link',
  'Copy Contact Email',
  'Copy Phone Number',
  'Edit links',
];

// Tablet/desktop floating widget only — the phone equivalent is the
// hamburger menu's Quick Links submenu (see MobileMenu tests).
describe('QuickLinks', () => {
  beforeEach(() => {
    mockHandleCopy.mockClear();
  });

  it('renders nothing when signed out', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: { auth: authState() },
    });

    for (const name of LINK_NAMES) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });

  it('renders each of the 5 links plus edit exactly once', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    for (const name of LINK_NAMES) {
      expect(screen.getAllByRole('button', { name })).toHaveLength(1);
    }
  });

  it('renders the widget as an absolutely-positioned, vertically-stacked panel attached to the sidebar edge, shown on desktop only (phones and tablets use menus instead)', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    const widget = screen
      .getByRole('button', { name: 'Copy LinkedIn Link' })
      .closest('.absolute')!;
    expect(widget).toHaveClass(
      'hidden',
      'lg:flex',
      'right-0',
      'translate-x-full',
      'top-1/2',
    );
    expect(widget).not.toHaveClass('md:flex');
  });

  it('copies the LinkedIn link with its label when set', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({
          user: { ...baseUser, linkedinUrl: 'https://linkedin.com/in/x' },
          isAuthenticated: true,
        }),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy LinkedIn Link' }));
    expect(mockHandleCopy).toHaveBeenCalledWith(
      'https://linkedin.com/in/x',
      'LinkedIn link',
      expect.anything(),
    );
  });

  it('copies the phone number with its label when set', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({
          user: { ...baseUser, phoneNumber: '+14155552671' },
          isAuthenticated: true,
        }),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy Phone Number' }));
    expect(mockHandleCopy).toHaveBeenCalledWith(
      '+14155552671',
      'Phone number',
      expect.anything(),
    );
  });

  it('passes an empty string to handleCopy when a link is unset', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy GitHub Link' }));
    expect(mockHandleCopy).toHaveBeenCalledWith(
      '',
      'GitHub link',
      expect.anything(),
    );
  });

  it('applies a muted style to unset links and not to set ones', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({
          user: { ...baseUser, linkedinUrl: 'https://linkedin.com/in/x' },
          isAuthenticated: true,
        }),
      },
    });

    expect(
      screen.getByRole('button', { name: 'Copy LinkedIn Link' }),
    ).not.toHaveClass('opacity-40');
    expect(
      screen.getByRole('button', { name: 'Copy GitHub Link' }),
    ).toHaveClass('opacity-40');
  });

  it('shows the action name in a tooltip on hover', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    fireEvent.mouseEnter(
      screen.getByRole('button', { name: 'Copy Website Link' }).parentElement!,
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copy Website Link');
  });

  it('shows an extra link button only once that link has a value', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({
          user: { ...baseUser, extraLink1Url: 'https://portfolio.dev' },
          isAuthenticated: true,
        }),
      },
    });

    expect(
      screen.getByRole('button', { name: 'Copy Extra Link 1' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Copy Extra Link 2' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy Extra Link 1' }));
    expect(mockHandleCopy).toHaveBeenCalledWith(
      'https://portfolio.dev',
      'Extra link 1',
      expect.anything(),
    );
  });

  it('opens the edit modal when the edit icon is clicked', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit links' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Quick Links')).toBeInTheDocument();
  });
});
