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

// Icons render twice: once in the mobile inline row (lg:hidden), once in the
// desktop floating widget (hidden lg:flex) — jsdom doesn't evaluate media
// queries, so both are present in the DOM and tests must account for that.
describe('QuickLinks', () => {
  beforeEach(() => {
    mockHandleCopy.mockClear();
  });

  it('renders nothing when signed out', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: { auth: authState() },
    });

    expect(screen.queryByTitle('Copy LinkedIn link')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit links')).not.toBeInTheDocument();
  });

  it('renders all 5 icons in both the mobile row and the desktop floating widget', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    expect(screen.getAllByTitle('Copy LinkedIn link')).toHaveLength(2);
    expect(screen.getAllByTitle('Copy GitHub link')).toHaveLength(2);
    expect(screen.getAllByTitle('Copy website link')).toHaveLength(2);
    expect(screen.getAllByTitle('Copy contact email')).toHaveLength(2);
    expect(screen.getAllByTitle('Edit links')).toHaveLength(2);
  });

  it('renders the desktop widget as an absolutely-positioned, vertically-stacked panel attached to the sidebar edge', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    const [, desktopButton] = screen.getAllByTitle('Copy LinkedIn link');
    const widget = desktopButton.parentElement!;
    expect(widget.className).toContain('flex-col');
    expect(widget.className).toContain('absolute');
    expect(widget.className).toContain('right-0');
    expect(widget.className).toContain('translate-x-full');
    expect(widget.className).toContain('top-1/2');
  });

  it('renders the mobile row as a horizontal, inline flex row hidden on desktop', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    const [mobileButton] = screen.getAllByTitle('Copy LinkedIn link');
    const row = mobileButton.parentElement!;
    expect(row.className).toContain('lg:hidden');
    expect(row.className).not.toContain('flex-col');
  });

  it('copies the LinkedIn link with its label when set, from either layout', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({
          user: { ...baseUser, linkedinUrl: 'https://linkedin.com/in/x' },
          isAuthenticated: true,
        }),
      },
    });

    const [, desktopButton] = screen.getAllByTitle('Copy LinkedIn link');
    fireEvent.click(desktopButton);
    expect(mockHandleCopy).toHaveBeenCalledWith(
      'https://linkedin.com/in/x',
      'LinkedIn link',
      expect.anything(),
    );
  });

  it('passes an empty string to handleCopy when a link is unset', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    const [mobileButton] = screen.getAllByTitle('Copy GitHub link');
    fireEvent.click(mobileButton);
    expect(mockHandleCopy).toHaveBeenCalledWith(
      '',
      'GitHub link',
      expect.anything(),
    );
  });

  it('applies a muted style to unset links and not to set ones, in both layouts', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({
          user: { ...baseUser, linkedinUrl: 'https://linkedin.com/in/x' },
          isAuthenticated: true,
        }),
      },
    });

    for (const btn of screen.getAllByTitle('Copy LinkedIn link')) {
      expect(btn.className).not.toContain('opacity-40');
    }
    for (const btn of screen.getAllByTitle('Copy GitHub link')) {
      expect(btn.className).toContain('opacity-40');
    }
  });

  it('opens the edit modal when either edit icon is clicked', () => {
    renderWithProviders(<QuickLinks />, {
      preloadedState: {
        auth: authState({ user: baseUser, isAuthenticated: true }),
      },
    });

    const [, desktopEditButton] = screen.getAllByTitle('Edit links');
    fireEvent.click(desktopEditButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Quick Links')).toBeInTheDocument();
  });
});
