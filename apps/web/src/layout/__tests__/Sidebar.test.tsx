import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../Sidebar';
import SidebarHeader from '../Sidebar/Header';
import SidebarNavigation from '../Sidebar/Navigation';
import SidebarToggle from '../Sidebar/Toggle';

const signedIn = {
  auth: {
    user: { id: '1', email: 'test@test.com', name: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
  },
};
const signedOut = {
  auth: { user: null, isAuthenticated: false, isLoading: false },
};

describe('Sidebar Components', () => {
  describe('Sidebar Toggle', () => {
    it('calls onToggle when clicked', () => {
      const onToggle = vi.fn();
      renderWithProviders(
        <SidebarToggle isExpanded={true} onToggle={onToggle} />,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onToggle).toHaveBeenCalledOnce();
    });

    it('names the button for the action it will take', () => {
      const { rerender } = renderWithProviders(
        <SidebarToggle isExpanded={true} onToggle={vi.fn()} />,
      );
      expect(
        screen.getByRole('button', { name: 'Collapse Sidebar' }),
      ).toBeInTheDocument();

      rerender(<SidebarToggle isExpanded={false} onToggle={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: 'Expand Sidebar' }),
      ).toBeInTheDocument();
    });

    it('shows a tooltip on hover instead of a native title', () => {
      renderWithProviders(
        <SidebarToggle isExpanded={true} onToggle={vi.fn()} />,
      );
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('title');

      fireEvent.mouseEnter(button.parentElement!);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Collapse Sidebar',
      );
    });
  });

  describe('Sidebar Header', () => {
    it('links to home', () => {
      renderWithProviders(<SidebarHeader isExpanded={true} />);
      expect(
        screen.getByRole('link', { name: 'Career Covered' }),
      ).toHaveAttribute('href', '/');
    });

    it('shows the title only on expanded desktop', () => {
      const { rerender } = renderWithProviders(
        <SidebarHeader isExpanded={true} />,
      );
      expect(screen.getByText('Career Covered')).toHaveClass('hidden', 'lg:block');

      rerender(<SidebarHeader isExpanded={false} />);
      expect(screen.getByText('Career Covered')).not.toHaveClass('lg:block');
    });
  });

  describe('Sidebar Navigation', () => {
    it('renders the primary items as links', () => {
      renderWithProviders(<SidebarNavigation isExpanded={true} />, {
        preloadedState: signedOut,
      });
      for (const [name, href] of [
        ['Cover Letter', '/'],
        ['FAQ', '/faq'],
        ['Support', '/support'],
      ]) {
        expect(screen.getByRole('link', { name })).toHaveAttribute(
          'href',
          href,
        );
      }
    });

    it('hides Templates, Previously Created and Resumes from guests', () => {
      renderWithProviders(<SidebarNavigation isExpanded={false} />, {
        preloadedState: signedOut,
      });
      for (const name of ['Templates', 'Previously Created', 'Resumes']) {
        expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
      }
    });

    it.each(['/', '/faq', '/resume'])(
      'always shows the cover-letter sub-items with icons when signed in, even on %s',
      (route) => {
        renderWithProviders(<SidebarNavigation isExpanded={false} />, {
          preloadedState: signedIn,
          route,
        });
        for (const name of ['Templates', 'Previously Created']) {
          const link = screen.getByRole('link', { name });
          expect(link.querySelector('svg')).toBeInTheDocument();
        }
      },
    );

    it('marks only the current route as active', () => {
      renderWithProviders(<SidebarNavigation isExpanded={true} />, {
        preloadedState: signedIn,
        route: '/cover-letter/templates',
      });
      expect(screen.getByRole('link', { name: 'Templates' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(
        screen.getByRole('link', { name: 'Cover Letter' }),
      ).not.toHaveAttribute('aria-current');
    });

    it('highlights the active item', () => {
      renderWithProviders(<SidebarNavigation isExpanded={true} />);
      expect(screen.getByRole('link', { name: 'Cover Letter' })).toHaveClass(
        'bg-brand-100',
      );
    });

    it('keeps FAQ and Support out of the phone top bar', () => {
      renderWithProviders(<SidebarNavigation isExpanded={true} />);
      for (const name of ['FAQ', 'Support']) {
        const wrapper = screen
          .getByRole('link', { name })
          .closest('div.md\\:flex');
        expect(wrapper).toHaveClass('hidden', 'md:flex');
      }
      expect(
        screen.getByRole('link', { name: 'Cover Letter' }).closest('.hidden'),
      ).toBeNull();
    });

    it('shows the item name in a tooltip on hover and hides it on leave', () => {
      renderWithProviders(<SidebarNavigation isExpanded={false} />, {
        preloadedState: signedIn,
      });
      const trigger = screen.getByRole('link', { name: 'Resumes' })
        .parentElement!;

      fireEvent.mouseEnter(trigger);
      expect(screen.getByRole('tooltip')).toHaveTextContent('Resumes');

      fireEvent.mouseLeave(trigger);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Full Sidebar', () => {
    it('is 180px wide when expanded and falls back to the rail when collapsed', () => {
      const { container: expandedContainer } = renderWithProviders(
        <Sidebar isExpanded={true} onToggle={vi.fn()} />,
      );
      expect(expandedContainer.firstChild).toHaveClass('lg:w-[180px]');

      const { container: collapsedContainer } = renderWithProviders(
        <Sidebar isExpanded={false} onToggle={vi.fn()} />,
      );
      expect(collapsedContainer.firstChild).toHaveClass('md:w-16');
      expect(collapsedContainer.firstChild).not.toHaveClass('lg:w-[180px]');
    });

    it('adds the Quick Links rail icon for tablets only', () => {
      renderWithProviders(<Sidebar isExpanded={true} onToggle={vi.fn()} />, {
        preloadedState: signedIn,
      });
      const railButton = screen.getByRole('button', { name: 'Quick Links' });
      expect(railButton.closest('.lg\\:hidden')).not.toBeNull();
      expect(railButton.closest('.hidden.md\\:flex')).not.toBeNull();
    });

    it('renders the hamburger for phones and the control cluster for tablet/desktop', () => {
      renderWithProviders(<Sidebar isExpanded={true} onToggle={vi.fn()} />, {
        preloadedState: signedOut,
      });
      const hamburger = screen.getByRole('button', { name: 'Open menu' });
      expect(hamburger.closest('.md\\:hidden')).not.toBeNull();

      const signIn = screen.getByRole('button', { name: 'Sign In' });
      const cluster = signIn.closest('.hidden.md\\:flex');
      expect(cluster).not.toBeNull();
      expect(
        within(cluster as HTMLElement).getByRole('button', {
          name: 'Switch to Dark Mode',
        }),
      ).toBeInTheDocument();
    });
  });
});
