import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useViewMode } from '../useViewMode';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('useViewMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to grid when localStorage is empty', () => {
    const { result } = renderHook(() => useViewMode('resume_view_mode'));
    expect(result.current.viewMode).toBe('grid');
  });

  it('defaults to the given default mode when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useViewMode('templates_view_mode', 'list'),
    );
    expect(result.current.viewMode).toBe('list');
  });

  it('defaults to grid when the stored value is invalid', () => {
    localStorage.setItem('cl_resume_view_mode', JSON.stringify('foo'));
    const { result } = renderHook(() => useViewMode('resume_view_mode'));
    expect(result.current.viewMode).toBe('grid');
  });

  it('reads back a valid stored value', () => {
    localStorage.setItem('cl_resume_view_mode', JSON.stringify('list'));
    const { result } = renderHook(() => useViewMode('resume_view_mode'));
    expect(result.current.viewMode).toBe('list');
  });

  it('setViewMode updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useViewMode('resume_view_mode'));

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
    expect(localStorage.getItem('cl_resume_view_mode')).toBe('"list"');
  });

  it('uses separate storage keys for separate views', () => {
    const { result: resumeResult } = renderHook(() =>
      useViewMode('resume_view_mode'),
    );
    const { result: templatesResult } = renderHook(() =>
      useViewMode('templates_view_mode'),
    );

    act(() => {
      resumeResult.current.setViewMode('list');
    });

    expect(resumeResult.current.viewMode).toBe('list');
    expect(templatesResult.current.viewMode).toBe('grid');
  });

  it('reports isMobile as false by default (jsdom default viewport)', () => {
    const { result } = renderHook(() => useViewMode('resume_view_mode'));
    expect(result.current.isMobile).toBe(false);
  });

  it('forces viewMode to grid on mobile even when list is stored', () => {
    mockMatchMedia(true);
    localStorage.setItem('cl_resume_view_mode', JSON.stringify('list'));

    const { result } = renderHook(() => useViewMode('resume_view_mode'));

    expect(result.current.isMobile).toBe(true);
    expect(result.current.viewMode).toBe('grid');
  });

  it('still persists the underlying preference to localStorage on mobile', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useViewMode('resume_view_mode'));

    act(() => {
      result.current.setViewMode('list');
    });

    // The stored preference is saved even though the effective viewMode
    // stays 'grid' on mobile — it takes effect again once back on desktop.
    expect(localStorage.getItem('cl_resume_view_mode')).toBe('"list"');
    expect(result.current.viewMode).toBe('grid');
  });
});
