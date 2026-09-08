import { render } from '@testing-library/react';
import { act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useElementHeight } from '../useElementHeight';

type ResizeCallback = (
  entries: Pick<ResizeObserverEntry, 'contentRect'>[],
) => void;

function installMockResizeObserver() {
  let capturedCallback: ResizeCallback | null = null;
  const observe = vi.fn();
  const disconnect = vi.fn();

  class MockResizeObserver {
    constructor(callback: ResizeCallback) {
      capturedCallback = callback;
    }
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
  }

  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  return {
    triggerResize: (height: number) => {
      capturedCallback?.([{ contentRect: { height } as DOMRectReadOnly }]);
    },
    observe,
    disconnect,
    restore: () => {
      globalThis.ResizeObserver = original;
    },
  };
}

function TestHarness({
  onHeight,
}: {
  onHeight: (height: number | null) => void;
}) {
  const [ref, height] = useElementHeight<HTMLDivElement>();
  onHeight(height);
  return <div ref={ref}>content</div>;
}

describe('useElementHeight', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with null before any measurement', () => {
    const mock = installMockResizeObserver();
    const onHeight = vi.fn();
    render(<TestHarness onHeight={onHeight} />);

    expect(onHeight).toHaveBeenLastCalledWith(null);
    mock.restore();
  });

  it('observes the ref element on mount and disconnects on unmount', () => {
    const mock = installMockResizeObserver();
    const { unmount } = render(<TestHarness onHeight={vi.fn()} />);

    expect(mock.observe).toHaveBeenCalledTimes(1);
    unmount();
    expect(mock.disconnect).toHaveBeenCalledTimes(1);
    mock.restore();
  });

  it('updates the height when the observer reports a resize', () => {
    const mock = installMockResizeObserver();
    const onHeight = vi.fn();
    render(<TestHarness onHeight={onHeight} />);

    act(() => {
      mock.triggerResize(123);
    });

    expect(onHeight).toHaveBeenLastCalledWith(123);
    mock.restore();
  });
});
