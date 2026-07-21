import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCustom = vi.hoisted(() => vi.fn(() => 'toast-id'));
vi.mock('react-hot-toast', () => ({
  toast: {
    custom: mockCustom,
    dismiss: vi.fn(),
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

  it('renders the message text', () => {
    showToast('Test message');

    const [renderFn] = mockCustom.mock.calls[0];
    expect(renderFn).toBeInstanceOf(Function);
  });
});
