import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { DragEndEvent } from '@dnd-kit/core';
import { useReorderDnd } from '../useReorderDnd';
import type { Resume } from '../types';

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'Resume',
  originalFileName: 'r.pdf',
  mimeType: 'application/pdf',
  fileSize: 100,
  order: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const dragEvent = (activeId: string, overId: string | null): DragEndEvent =>
  ({
    active: { id: activeId },
    over: overId ? { id: overId } : null,
  }) as DragEndEvent;

describe('useReorderDnd', () => {
  it('calls onReorder with the array moved from the active index to the over index', () => {
    const a = mockResume({ id: 'a', order: 0 });
    const b = mockResume({ id: 'b', order: 1 });
    const c = mockResume({ id: 'c', order: 2 });
    const onReorder = vi.fn();

    const { result } = renderHook(() =>
      useReorderDnd([a, b, c], onReorder),
    );

    result.current.handleDragEnd(dragEvent('a', 'c'));

    expect(onReorder).toHaveBeenCalledWith([b, c, a]);
  });

  it('does not call onReorder when there is no drop target', () => {
    const a = mockResume({ id: 'a' });
    const b = mockResume({ id: 'b' });
    const onReorder = vi.fn();

    const { result } = renderHook(() => useReorderDnd([a, b], onReorder));
    result.current.handleDragEnd(dragEvent('a', null));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not call onReorder when dropped on itself', () => {
    const a = mockResume({ id: 'a' });
    const b = mockResume({ id: 'b' });
    const onReorder = vi.fn();

    const { result } = renderHook(() => useReorderDnd([a, b], onReorder));
    result.current.handleDragEnd(dragEvent('a', 'a'));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not call onReorder when either id is not found in the list', () => {
    const a = mockResume({ id: 'a' });
    const b = mockResume({ id: 'b' });
    const onReorder = vi.fn();

    const { result } = renderHook(() => useReorderDnd([a, b], onReorder));
    result.current.handleDragEnd(dragEvent('a', 'missing'));

    expect(onReorder).not.toHaveBeenCalled();
  });
});
