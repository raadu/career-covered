import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopy } from '../useCopy';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCopy hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it('should initialize copied state as false', () => {
    const { result } = renderHook(() => useCopy());
    expect(result.current.copied).toBe(false);
  });

  it('should copy text and show success toast', () => {
    const { result } = renderHook(() => useCopy());
    
    act(() => {
      result.current.handleCopy('Hello, world!', 'Test Text');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, world!');
    expect(result.current.copied).toBe(true);
    expect(toast.success).toHaveBeenCalledWith(
      'Test Text copied!',
      expect.any(Object)
    );
  });

  it('should show error toast if value is empty', () => {
    const { result } = renderHook(() => useCopy());

    act(() => {
      result.current.handleCopy('', 'Test Text');
    });

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      'Nothing to copy!',
      expect.any(Object)
    );
  });

  it('should call onSuccess callback if provided', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCopy({ onSuccess }));

    act(() => {
      result.current.handleCopy('Some text');
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should prevent event propagation if MouseEvent is provided', () => {
    const { result } = renderHook(() => useCopy());
    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleCopy('Some text', 'Label', mockEvent);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should reset copied state after 2 seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopy());

    act(() => {
      result.current.handleCopy('Some text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
    vi.useRealTimers();
  });
});
