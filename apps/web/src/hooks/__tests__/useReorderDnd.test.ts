import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { DragEndEvent } from '@dnd-kit/core';
import { useReorderDnd } from '../useReorderDnd';

interface Item {
  id: string;
  label: string;
}

const item = (overrides: Partial<Item> = {}): Item => ({
  id: 'a',
  label: 'Item',
  ...overrides,
});

const getId = (item: Item) => item.id;

const dragEvent = (activeId: string, overId: string | null): DragEndEvent =>
  ({
    active: { id: activeId },
    over: overId ? { id: overId } : null,
  }) as DragEndEvent;

describe('useReorderDnd', () => {
  it('calls onReorder with the array moved from the active index to the over index', () => {
    const a = item({ id: 'a' });
    const b = item({ id: 'b' });
    const c = item({ id: 'c' });
    const onReorder = vi.fn();

    const { result } = renderHook(() =>
      useReorderDnd([a, b, c], getId, onReorder),
    );

    result.current.handleDragEnd(dragEvent('a', 'c'));

    expect(onReorder).toHaveBeenCalledWith([b, c, a]);
  });

  it('does not call onReorder when there is no drop target', () => {
    const a = item({ id: 'a' });
    const b = item({ id: 'b' });
    const onReorder = vi.fn();

    const { result } = renderHook(() =>
      useReorderDnd([a, b], getId, onReorder),
    );
    result.current.handleDragEnd(dragEvent('a', null));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not call onReorder when dropped on itself', () => {
    const a = item({ id: 'a' });
    const b = item({ id: 'b' });
    const onReorder = vi.fn();

    const { result } = renderHook(() =>
      useReorderDnd([a, b], getId, onReorder),
    );
    result.current.handleDragEnd(dragEvent('a', 'a'));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not call onReorder when either id is not found in the list', () => {
    const a = item({ id: 'a' });
    const b = item({ id: 'b' });
    const onReorder = vi.fn();

    const { result } = renderHook(() =>
      useReorderDnd([a, b], getId, onReorder),
    );
    result.current.handleDragEnd(dragEvent('a', 'missing'));

    expect(onReorder).not.toHaveBeenCalled();
  });
});
