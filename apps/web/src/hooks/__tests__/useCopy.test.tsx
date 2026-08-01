import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopy } from '../useCopy';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({
  showToast: mockShowToast,
}));

describe('useCopy hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(mockShowToast).toHaveBeenCalledWith('Test Text copied!', {
      type: 'success',
      duration: undefined,
    });
  });

  it('should show error toast if value is empty', () => {
    const { result } = renderHook(() => useCopy());

    act(() => {
      result.current.handleCopy('', 'Test Text');
    });

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith('Nothing to copy!', {
      type: 'error',
    });
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
