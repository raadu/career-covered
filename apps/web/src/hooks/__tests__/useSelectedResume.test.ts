import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectedResume } from '../useSelectedResume';

describe('useSelectedResume', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to null when nothing is stored', () => {
    const { result } = renderHook(() => useSelectedResume());
    const [selectedResumeId] = result.current;
    expect(selectedResumeId).toBeNull();
  });

  it('reads back a previously stored id', () => {
    localStorage.setItem('cl_selected_resume_id', JSON.stringify('r1'));
    const { result } = renderHook(() => useSelectedResume());
    const [selectedResumeId] = result.current;
    expect(selectedResumeId).toBe('r1');
  });

  it('persists a new selection to localStorage', () => {
    const { result } = renderHook(() => useSelectedResume());

    act(() => {
      const [, setSelectedResumeId] = result.current;
      setSelectedResumeId('r2');
    });

    expect(result.current[0]).toBe('r2');
    expect(localStorage.getItem('cl_selected_resume_id')).toBe('"r2"');
  });

  it('persists clearing the selection back to null', () => {
    const { result } = renderHook(() => useSelectedResume());

    act(() => {
      result.current[1]('r1');
    });
    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
    expect(localStorage.getItem('cl_selected_resume_id')).toBe('null');
  });
});
