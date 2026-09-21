import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useViewMode } from '../useViewMode';

describe('useViewMode', () => {
  beforeEach(() => {
    localStorage.clear();
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
});
