import { screen, fireEvent, within } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderWithProviders,
  type DeepPartial,
} from '../../../../../tests/test-utils';
import type { RootState } from 'store';
import MobileMenu from '..';

const mockHandleCopy = vi.fn();
vi.mock('hooks/useCopy', () => ({
  useCopy: () => ({ copied: false, handleCopy: mockHandleCopy }),
}));

const mockLogout = vi.hoisted(() => vi.fn());
vi.mock('store/authSlice', async () => {
  const actual = await vi.importActual('store/authSlice');
  return { ...actual, logoutUser: () => mockLogout };
});

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
const signedOut = {
  auth: { user: null, isAuthenticated: false, isLoading: false },
};

const LocationProbe = () => (
  <span data-testid="location">{useLocation().pathname}</span>
);

const renderMenu = (preloadedState: DeepPartial<RootState> = signedIn) =>
  renderWithProviders(
    <>
      <MobileMenu />
      <button>Page content</button>
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </>,
    { preloadedState },
  );

const openMenu = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

const menu = () => screen.getByRole('menu');

describe('MobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('opening and closing', () => {
    it('is closed initially, with a collapsed trigger', () => {
      renderMenu();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Open menu' }),
      ).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens on trigger click and wires aria-expanded/aria-controls', () => {
      renderMenu();
      openMenu();

      const trigger = screen.getByRole('button', { name: 'Close menu' });
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', menu().id);
    });

    it('portals the panel into document.body', () => {
      renderMenu();
      openMenu();
      expect(menu().parentElement).toBe(document.body);
    });

    it('closes when the trigger is clicked again', () => {
      renderMenu();
      openMenu();
      fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes on Escape and returns focus to the trigger', () => {
      renderMenu();
      openMenu();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
    });

    it('ignores other keys', () => {
      renderMenu();
      openMenu();
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(menu()).toBeInTheDocument();
    });

    it('closes on a press outside, but not on a press inside the panel', () => {
      renderMenu();
      openMenu();

      fireEvent.mouseDown(menu());
      expect(menu()).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByRole('button', { name: 'Page content' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes when the viewport is resized', () => {
      renderMenu();
      openMenu();
      fireEvent(window, new Event('resize'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('items', () => {
    it('lists the signed-in items in order', () => {
      renderMenu();
      openMenu();
      const names = within(menu())
        .getAllByRole('menuitem')
        .map((el) => el.textContent);
      expect(names).toEqual([
        'Dark Mode',
        'FAQ',
        'Support',
        'Quick Links',
        'Logout',
      ]);
    });

    it('shows Sign In instead of Logout, and no Quick Links, for guests', () => {
      renderMenu(signedOut);
      openMenu();
      const names = within(menu())
        .getAllByRole('menuitem')
        .map((el) => el.textContent);
      expect(names).toEqual(['Dark Mode', 'FAQ', 'Support', 'Sign In']);
    });

    it('toggles dark mode, closes, and relabels the item next time', () => {
      renderMenu();
      openMenu();
      fireEvent.click(within(menu()).getByRole('menuitem', { name: 'Dark Mode' }));

      expect(document.documentElement).toHaveClass('dark');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      openMenu();
      expect(
        within(menu()).getByRole('menuitem', { name: 'Light Mode' }),
      ).toBeInTheDocument();
    });

    it.each([
      ['FAQ', '/faq'],
      ['Support', '/support'],
    ])('navigates to %s and closes', (name, path) => {
      renderMenu();
      openMenu();
      fireEvent.click(within(menu()).getByRole('menuitem', { name }));

      expect(screen.getByTestId('location')).toHaveTextContent(path);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens the auth modal from Sign In', () => {
      const { store } = renderMenu(signedOut);
      openMenu();
      fireEvent.click(within(menu()).getByRole('menuitem', { name: 'Sign In' }));

      expect(store.getState().auth.isAuthModalOpen).toBe(true);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('asks for confirmation on Logout and signs out only once confirmed', () => {
      mockLogout.mockReturnValue({ unwrap: () => Promise.resolve() });
      renderMenu();
      openMenu();
      fireEvent.click(within(menu()).getByRole('menuitem', { name: 'Logout' }));

      expect(mockLogout).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Sure!' }));
      expect(mockLogout).toHaveBeenCalledOnce();
    });

    it('keeps the user signed in when the logout confirmation is cancelled', () => {
      renderMenu();
      openMenu();
      fireEvent.click(within(menu()).getByRole('menuitem', { name: 'Logout' }));
      fireEvent.click(screen.getByRole('button', { name: 'Nope' }));

      expect(mockLogout).not.toHaveBeenCalled();
      expect(
        screen.queryByText('Are you sure you want to sign out?'),
      ).not.toBeInTheDocument();
    });

    it('shows each item name in a tooltip on hover', () => {
      renderMenu();
      openMenu();
      fireEvent.mouseEnter(
        within(menu()).getByRole('menuitem', { name: 'FAQ' }).parentElement!,
      );
      expect(screen.getByRole('tooltip')).toHaveTextContent('FAQ');
    });
  });

  describe('Quick Links submenu', () => {
    const openQuickLinks = () => {
      renderMenu();
      openMenu();
      fireEvent.click(
        within(menu()).getByRole('menuitem', { name: 'Quick Links' }),
      );
    };

    it('starts collapsed', () => {
      renderMenu();
      openMenu();
      expect(
        within(menu()).getByRole('menuitem', { name: 'Quick Links' }),
      ).toHaveAttribute('aria-expanded', 'false');
      expect(
        within(menu()).queryByRole('group', { name: 'Quick Links' }),
      ).not.toBeInTheDocument();
    });

    it('expands to all five links plus Edit, with icons, and keeps the menu open', () => {
      openQuickLinks();
      const group = within(menu()).getByRole('group', { name: 'Quick Links' });
      const items = within(group).getAllByRole('menuitem');

      expect(items.map((el) => el.textContent)).toEqual([
        'LinkedIn',
        'GitHub',
        'Website',
        'Email',
        'Phone',
        'Edit links',
      ]);
      for (const item of items) {
        expect(item.querySelector('svg')).toBeInTheDocument();
      }
      expect(
        within(menu()).getByRole('menuitem', { name: 'Quick Links' }),
      ).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses again on a second tap', () => {
      openQuickLinks();
      fireEvent.click(
        within(menu()).getByRole('menuitem', { name: 'Quick Links' }),
      );
      expect(
        within(menu()).queryByRole('group', { name: 'Quick Links' }),
      ).not.toBeInTheDocument();
    });

    it('copies a saved link with its toast label, leaving the menu open', () => {
      openQuickLinks();
      fireEvent.click(within(menu()).getByRole('menuitem', { name: 'LinkedIn' }));

      expect(mockHandleCopy).toHaveBeenCalledWith(
        'https://linkedin.com/in/x',
        'LinkedIn link',
      );
      expect(menu()).toBeInTheDocument();
    });

    it('only applies hover styling where real hover exists, so a tapped link does not stay highlighted', () => {
      openQuickLinks();
      const linkedin = within(menu()).getByRole('menuitem', { name: 'LinkedIn' });

      expect(linkedin.className).not.toMatch(/(^|\s)hover:bg-/);
      expect(linkedin).toHaveClass(
        '[@media(hover:hover)]:hover:bg-neutral-100',
        'active:bg-neutral-100',
      );
    });

    it('passes an empty value for an unset link and mutes that row', () => {
      openQuickLinks();
      const github = within(menu()).getByRole('menuitem', { name: 'GitHub' });

      expect(github).toHaveClass('opacity-50');
      expect(
        within(menu()).getByRole('menuitem', { name: 'LinkedIn' }),
      ).not.toHaveClass('opacity-50');

      fireEvent.click(github);
      expect(mockHandleCopy).toHaveBeenCalledWith('', 'GitHub link');
    });

    it('opens the edit-links modal and closes the menu', () => {
      openQuickLinks();
      fireEvent.click(
        within(menu()).getByRole('menuitem', { name: 'Edit links' }),
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.getByText('Edit Quick Links')).toBeInTheDocument();
    });
  });
});
