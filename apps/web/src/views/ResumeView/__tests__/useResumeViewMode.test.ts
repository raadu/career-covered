import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeViewMode } from '../useResumeViewMode';

describe('useResumeViewMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to grid when localStorage is empty', () => {
    const { result } = renderHook(() => useResumeViewMode());
    expect(result.current.viewMode).toBe('grid');
  });

  it('defaults to grid when the stored value is invalid', () => {
    localStorage.setItem('cl_resume_view_mode', JSON.stringify('foo'));
    const { result } = renderHook(() => useResumeViewMode());
    expect(result.current.viewMode).toBe('grid');
  });

  it('reads back a valid stored value', () => {
    localStorage.setItem('cl_resume_view_mode', JSON.stringify('list'));
    const { result } = renderHook(() => useResumeViewMode());
    expect(result.current.viewMode).toBe('list');
  });

  it('setViewMode updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useResumeViewMode());

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
    expect(localStorage.getItem('cl_resume_view_mode')).toBe('"list"');
  });
});
