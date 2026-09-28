import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';

type CustomToastCall = (
  renderFn: (t: { id: string; visible: boolean }) => ReactNode,
  options: { duration?: number; position?: string },
) => string;

const mockCustom = vi.hoisted(() => vi.fn<CustomToastCall>(() => 'toast-id'));
const mockDismiss = vi.hoisted(() => vi.fn());
vi.mock('react-hot-toast', () => ({
  toast: {
    custom: mockCustom,
    dismiss: mockDismiss,
  },
}));

import { showToast } from '../common/Toast';

describe('showToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toast.custom with success type by default', () => {
    showToast('Hello!');

    expect(mockCustom).toHaveBeenCalledOnce();
    const [, options] = mockCustom.mock.calls[0];
    expect(options.duration).toBe(2000);
    expect(options.position).toBe('bottom-right');
  });

  it('respects custom duration and type', () => {
    showToast('Error!', { type: 'error', duration: 5000 });

    const [, options] = mockCustom.mock.calls[0];
    expect(options.duration).toBe(5000);
  });

  it('returns the toast id from react-hot-toast', () => {
    expect(showToast('Hi')).toBe('toast-id');
  });

  describe('rendered toast', () => {
    const renderToast = (
      message: ReactNode,
      options?: Parameters<typeof showToast>[1],
      visible = true,
    ) => {
      showToast(message, options);
      const [renderFn] = mockCustom.mock.calls[0];
      return render(<>{renderFn({ id: 't-1', visible })}</>);
    };

    it('uses tight, even vertical padding around the text', () => {
      const { container } = renderToast('Saved');
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('py-1.5', 'items-center');
      expect(card).not.toHaveClass('py-3', 'items-start');

      // The 40px dismiss target is pulled out of the flow vertically so it
      // can't stretch the toast.
      expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveClass(
        'min-h-10',
        '-my-1.5',
      );
    });

    it('renders the message text', () => {
      renderToast('Test message');
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders a React node message as-is', () => {
      renderToast(<a href="#/templates">Open templates</a>);
      expect(
        screen.getByRole('link', { name: 'Open templates' }),
      ).toBeInTheDocument();
    });

    it.each([
      ['success', 'border-success-border'],
      ['error', 'border-danger-border'],
      ['info', 'border-neutral-200'],
    ] as const)('styles a %s toast with its border colour', (type, cls) => {
      const { container } = renderToast('msg', { type });
      expect(container.firstChild).toHaveClass(cls);
    });

    it.each([
      ['success', 1],
      ['error', 1],
      ['info', 0],
    ] as const)('renders %s with %i status icon(s)', (type, iconCount) => {
      const { container } = renderToast('msg', { type });
      // The dismiss button's X icon is always present; count the rest.
      const icons = container.querySelectorAll('svg');
      expect(icons.length - 1).toBe(iconCount);
    });

    it('uses the enter animation while visible and the exit animation once hidden', () => {
      const { container, unmount } = renderToast('msg', undefined, true);
      expect(container.firstChild).toHaveClass('animate-in');
      unmount();
      vi.clearAllMocks();

      const hidden = renderToast('msg', undefined, false);
      expect(hidden.container.firstChild).toHaveClass('animate-out');
    });

    it('dismisses that specific toast when the dismiss button is clicked', () => {
      renderToast('msg');
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(mockDismiss).toHaveBeenCalledWith('t-1');
    });
  });
});
