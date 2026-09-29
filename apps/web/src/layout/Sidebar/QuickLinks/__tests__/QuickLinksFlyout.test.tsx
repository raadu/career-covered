import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../../../tests/test-utils';
import QuickLinksFlyout from '../QuickLinksFlyout';

const mockHandleCopy = vi.fn();
vi.mock('hooks/useCopy', () => ({
  useCopy: () => ({ copied: false, handleCopy: mockHandleCopy }),
}));

const signedIn = {
  auth: {
    user: {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      linkedinUrl: 'https://linkedin.com/in/x',
    },
    isAuthenticated: true,
    isLoading: false,
  },
};

const renderFlyout = (preloadedState: object = signedIn) =>
  renderWithProviders(
    <>
      <QuickLinksFlyout />
      <button>Page content</button>
    </>,
    { preloadedState },
  );

const trigger = () => screen.getByRole('button', { name: 'Quick Links' });
const panel = () => screen.getByRole('menu', { name: 'Quick Links' });

describe('QuickLinksFlyout (tablet rail)', () => {
  beforeEach(() => {
    mockHandleCopy.mockClear();
  });

  it('renders nothing when signed out', () => {
    renderFlyout({
      auth: { user: null, isAuthenticated: false, isLoading: false },
    });
    expect(
      screen.queryByRole('button', { name: 'Quick Links' }),
    ).not.toBeInTheDocument();
  });

  it('shows a collapsed Quick Links icon button', () => {
    renderFlyout();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens a portaled panel listing every link plus Edit links', () => {
    renderFlyout();
    fireEvent.click(trigger());

    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', panel().id);
    expect(panel().parentElement).toBe(document.body);
    expect(
      within(panel())
        .getAllByRole('menuitem')
        .map((el) => el.textContent),
    ).toEqual(['LinkedIn', 'GitHub', 'Website', 'Email', 'Phone', 'Edit links']);
  });

  it('anchors the panel beside the rail, growing upward from the trigger', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      bottom: 740,
      left: 0,
      right: 64,
      width: 64,
      height: 40,
    } as DOMRect);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);

    renderFlyout();
    fireEvent.click(trigger());
    expect(panel().style.left).toBe('68px');
    expect(panel().style.bottom).toBe('60px');

    vi.restoreAllMocks();
  });

  it('copies a link with its toast label and keeps the panel open', () => {
    renderFlyout();
    fireEvent.click(trigger());
    fireEvent.click(within(panel()).getByRole('menuitem', { name: 'LinkedIn' }));

    expect(mockHandleCopy).toHaveBeenCalledWith(
      'https://linkedin.com/in/x',
      'LinkedIn link',
    );
    expect(panel()).toBeInTheDocument();
  });

  it('opens the edit modal from Edit links and closes the panel', () => {
    renderFlyout();
    fireEvent.click(trigger());
    fireEvent.click(within(panel()).getByRole('menuitem', { name: 'Edit links' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByText('Edit Quick Links')).toBeInTheDocument();
  });

  it('closes on a second click, on Escape, and on a press outside', () => {
    renderFlyout();

    fireEvent.click(trigger());
    fireEvent.click(trigger());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(trigger());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();

    fireEvent.click(trigger());
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Page content' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
