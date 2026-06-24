import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should initialize with false when localStorage is empty', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should initialize with true when localStorage is true', () => {
    localStorage.setItem('cl_darkMode', 'true');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should initialize with false when localStorage is false', () => {
    localStorage.setItem('cl_darkMode', 'false');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle state, update localStorage and DOM class', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleDark();
    });

    expect(result.current.isDark).toBe(true);
    expect(localStorage.getItem('cl_darkMode')).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.toggleDark();
    });

    expect(result.current.isDark).toBe(false);
    expect(localStorage.getItem('cl_darkMode')).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
