import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TableActions, { type TableAction } from '../TableActions';

const buildActions = (overrides?: Partial<Record<string, () => void>>) => {
  const actions: TableAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: <span>view-icon</span>,
      onClick: overrides?.view ?? vi.fn(),
    },
    {
      key: 'download',
      label: 'Download',
      icon: <span>download-icon</span>,
      onClick: overrides?.download ?? vi.fn(),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <span>delete-icon</span>,
      onClick: overrides?.delete ?? vi.fn(),
      variant: 'danger',
      dividerBefore: true,
    },
  ];
  return actions;
};

describe('TableActions', () => {
  describe('inline mode (default)', () => {
    it('renders one always-visible icon button per action', () => {
      render(<TableActions actions={buildActions()} />);
      expect(screen.getByTitle('View')).toBeInTheDocument();
      expect(screen.getByTitle('Download')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('calls the action handler when its button is clicked', () => {
      const onView = vi.fn();
      render(<TableActions actions={buildActions({ view: onView })} mode="inline" />);
      fireEvent.click(screen.getByTitle('View'));
      expect(onView).toHaveBeenCalledTimes(1);
    });

    it('does not render a kebab trigger', () => {
      render(<TableActions actions={buildActions()} mode="inline" />);
      expect(screen.queryByTitle('Actions')).not.toBeInTheDocument();
    });
  });

  describe('menu mode', () => {
    it('renders a closed kebab menu by default', () => {
      render(<TableActions actions={buildActions()} mode="menu" />);
      expect(screen.getByTitle('Actions')).toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens the menu on trigger click and shows all actions', () => {
      render(<TableActions actions={buildActions()} mode="menu" />);
      fireEvent.click(screen.getByTitle('Actions'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /view/i })).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /download/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });

    it('sets aria-expanded on the trigger while open', () => {
      render(<TableActions actions={buildActions()} mode="menu" />);
      const trigger = screen.getByTitle('Actions');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls the action handler and closes the menu when an item is clicked', () => {
      const onDelete = vi.fn();
      render(<TableActions actions={buildActions({ delete: onDelete })} mode="menu" />);
      fireEvent.click(screen.getByTitle('Actions'));
      fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the menu when clicking outside', () => {
      render(
        <div>
          <TableActions actions={buildActions()} mode="menu" />
          <button>outside</button>
        </div>,
      );
      fireEvent.click(screen.getByTitle('Actions'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByText('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the menu on Escape and refocuses the trigger', () => {
      render(<TableActions actions={buildActions()} mode="menu" />);
      const trigger = screen.getByTitle('Actions');
      fireEvent.click(trigger);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it('renders the popup into document.body via a portal, positioned fixed with a high z-index', () => {
      render(<TableActions actions={buildActions()} mode="menu" />);
      fireEvent.click(screen.getByTitle('Actions'));

      const menu = screen.getByRole('menu');
      expect(menu.parentElement).toBe(document.body);
      expect(menu.className).toContain('fixed');
      expect(menu.className).toContain('z-50');
    });

    describe('hover-away auto-close', () => {
      afterEach(() => {
        vi.useRealTimers();
      });

      it('closes after the mouse leaves the trigger without entering the menu', () => {
        vi.useFakeTimers();
        render(<TableActions actions={buildActions()} mode="menu" />);
        const trigger = screen.getByTitle('Actions');
        fireEvent.click(trigger);
        expect(screen.getByRole('menu')).toBeInTheDocument();

        fireEvent.mouseLeave(trigger);
        act(() => {
          vi.advanceTimersByTime(250);
        });

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });

      it('stays open if the mouse moves from the trigger into the menu', () => {
        vi.useFakeTimers();
        render(<TableActions actions={buildActions()} mode="menu" />);
        const trigger = screen.getByTitle('Actions');
        fireEvent.click(trigger);
        const menu = screen.getByRole('menu');

        fireEvent.mouseLeave(trigger);
        fireEvent.mouseEnter(menu);
        act(() => {
          vi.advanceTimersByTime(250);
        });

        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      it('closes after the mouse leaves the menu itself', () => {
        vi.useFakeTimers();
        render(<TableActions actions={buildActions()} mode="menu" />);
        fireEvent.click(screen.getByTitle('Actions'));
        const menu = screen.getByRole('menu');

        fireEvent.mouseEnter(menu);
        fireEvent.mouseLeave(menu);
        act(() => {
          vi.advanceTimersByTime(250);
        });

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });
});
