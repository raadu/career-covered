import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorageState } from '../useLocalStorageState';

describe('useLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with the default value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<boolean>('flag', false),
    );
    expect(result.current[0]).toBe(false);
  });

  it('initializes from a previously stored (JSON-encoded) value', () => {
    localStorage.setItem('cl_flag', 'true');
    const { result } = renderHook(() =>
      useLocalStorageState<boolean>('flag', false),
    );
    expect(result.current[0]).toBe(true);
  });

  it('falls back to the default value when the stored value cannot be parsed', () => {
    localStorage.setItem('cl_flag', 'not-json{{');
    const { result } = renderHook(() =>
      useLocalStorageState<boolean>('flag', false),
    );
    expect(result.current[0]).toBe(false);
  });

  it('updates state and persists the JSON-encoded value on set', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<boolean>('flag', false),
    );

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('cl_flag')).toBe('true');
  });

  it('supports custom serialize/deserialize functions', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<string>('mode', 'grid', {
        deserialize: (raw) => {
          const parsed = JSON.parse(raw);
          return parsed === 'grid' || parsed === 'list' ? parsed : 'grid';
        },
      }),
    );

    act(() => {
      result.current[1]('list');
    });

    expect(result.current[0]).toBe('list');
    expect(localStorage.getItem('cl_mode')).toBe('"list"');
  });
});
