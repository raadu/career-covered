import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useClear } from '../useClear';

describe('useClear hook', () => {
  it('should trigger the passed callback function', () => {
    const { result } = renderHook(() => useClear());
    const onClear = vi.fn();

    act(() => {
      result.current.handleClear(onClear);
    });

    expect(onClear).toHaveBeenCalledOnce();
  });

  it('should prevent event propagation when MouseEvent is provided', () => {
    const { result } = renderHook(() => useClear());
    const onClear = vi.fn();
    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleClear(onClear, mockEvent);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalledOnce();
    expect(onClear).toHaveBeenCalledOnce();
  });
});
