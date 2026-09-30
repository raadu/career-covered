import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useState, type ReactNode } from 'react';
import { createTestStore } from '../../../../tests/test-utils';
import { useResumeSelector } from '../useResumeSelector';
import type { Resume } from 'views/ResumeView/types';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({ showToast: mockShowToast }));

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

function renderUseResumeSelector(
  selectedResumeId: string | null,
  onSelectResume: (id: string | null) => void,
  authenticated = true,
) {
  const store = createTestStore({
    auth: { isAuthenticated: authenticated, isLoading: false },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useResumeSelector(selectedResumeId, onSelectResume), {
    wrapper,
  });
}

describe('useResumeSelector', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
  });

  it('fetches the resume list when authenticated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [mockResume()] })),
    );
    const { result } = renderUseResumeSelector(null, vi.fn());

    await waitFor(() => expect(result.current.resumes).toHaveLength(1));
  });

  it('does not fetch when unauthenticated', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderUseResumeSelector(null, vi.fn(), false);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe('auto-selecting an uploaded resume', () => {
    const pdf = () =>
      new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' });

    // GET /api/resumes returns `list()` at call time; POST returns the new one.
    const stubServer = (list: () => Resume[], created: Resume, postOk = true) =>
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string, init?: RequestInit) =>
          init?.method === 'POST'
            ? {
                ok: postOk,
                json: async () =>
                  postOk ? created : { message: 'Upload failed' },
              }
            : { ok: true, json: async () => list() },
        ),
      );

    it('selects the first resume the user uploads', async () => {
      const created = mockResume({ id: 'first' });
      let resumes: Resume[] = [];
      stubServer(() => resumes, created);
      const onSelectResume = vi.fn();
      const { result } = renderUseResumeSelector(null, onSelectResume);
      await waitFor(() => expect(result.current.resumes).toEqual([]));

      resumes = [created];
      await act(async () => {
        await result.current.uploadResume(pdf());
      });

      expect(onSelectResume).toHaveBeenLastCalledWith('first');
      expect(result.current.resumes.map((r) => r.id)).toEqual(['first']);
    });

    it('switches the selection to the newly uploaded resume when another was selected', async () => {
      const existing = mockResume({ id: 'old', order: 0 });
      const created = mockResume({ id: 'recent', order: 1 });
      let resumes: Resume[] = [existing];
      stubServer(() => resumes, created);
      const onSelectResume = vi.fn();
      const { result } = renderUseResumeSelector('old', onSelectResume);
      await waitFor(() => expect(result.current.resumes).toHaveLength(1));

      resumes = [existing, created];
      await act(async () => {
        await result.current.uploadResume(pdf());
      });

      expect(onSelectResume).toHaveBeenLastCalledWith('recent');
    });

    it('keeps the new selection — the stale-selection cleanup does not clear it', async () => {
      const created = mockResume({ id: 'new' });
      let resumes: Resume[] = [];
      stubServer(() => resumes, created);
      const store = createTestStore({
        auth: { isAuthenticated: true, isLoading: false },
      });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      // Real selection state, so the hook's cleanup effect runs against the
      // actual selected id after the upload settles.
      const { result } = renderHook(
        () => {
          const [selected, setSelected] = useState<string | null>(null);
          return { selected, ...useResumeSelector(selected, setSelected) };
        },
        { wrapper },
      );
      await waitFor(() => expect(result.current.resumes).toEqual([]));

      resumes = [created];
      await act(async () => {
        await result.current.uploadResume(pdf());
      });

      await waitFor(() => expect(result.current.resumes).toHaveLength(1));
      expect(result.current.selected).toBe('new');
    });

    it('selects and lists the new resume immediately, without waiting for the list refresh', async () => {
      const created = mockResume({ id: 'instant', name: 'Instant CV' });
      let hangRefresh = false;
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string, init?: RequestInit) => {
          if (init?.method === 'POST') {
            return { ok: true, json: async () => created };
          }
          // After the upload, the background refresh never resolves.
          if (hangRefresh) return new Promise(() => {});
          return { ok: true, json: async () => [] };
        }),
      );
      const onSelectResume = vi.fn();
      const { result } = renderUseResumeSelector(null, onSelectResume);
      await waitFor(() => expect(result.current.resumes).toEqual([]));

      hangRefresh = true;
      await act(async () => {
        await result.current.uploadResume(pdf());
      });

      expect(onSelectResume).toHaveBeenCalledWith('instant');
      expect(result.current.resumes.map((r) => r.id)).toEqual(['instant']);
      expect(result.current.isUploading).toBe(false);
    });

    it('does not duplicate the row once the refresh returns the same resume', async () => {
      const existing = mockResume({ id: 'old', order: 0 });
      const created = mockResume({ id: 'new', order: 1 });
      let resumes: Resume[] = [existing];
      stubServer(() => resumes, created);
      const { result } = renderUseResumeSelector('old', vi.fn());
      await waitFor(() => expect(result.current.resumes).toHaveLength(1));

      resumes = [existing, created];
      await act(async () => {
        await result.current.uploadResume(pdf());
      });

      await waitFor(() =>
        expect(result.current.resumes.map((r) => r.id)).toEqual(['old', 'new']),
      );
    });

    it('does not change the selection when the upload fails', async () => {
      const existing = mockResume({ id: 'old' });
      stubServer(() => [existing], mockResume({ id: 'never' }), false);
      const onSelectResume = vi.fn();
      const { result } = renderUseResumeSelector('old', onSelectResume);
      await waitFor(() => expect(result.current.resumes).toHaveLength(1));

      await act(async () => {
        await result.current.uploadResume(pdf());
      });

      expect(onSelectResume).not.toHaveBeenCalled();
    });

    it('does not change the selection for a rejected (non-PDF) file', async () => {
      stubServer(() => [], mockResume({ id: 'never' }));
      const onSelectResume = vi.fn();
      const { result } = renderUseResumeSelector(null, onSelectResume);
      await waitFor(() => expect(result.current.resumes).toEqual([]));

      await act(async () => {
        await result.current.uploadResume(
          new File(['x'], 'cv.docx', { type: 'application/msword' }),
        );
      });

      expect(onSelectResume).not.toHaveBeenCalled();
    });
  });

  it('toggleSelect selects an unselected id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [mockResume()] })),
    );
    const onSelectResume = vi.fn();
    const { result } = renderUseResumeSelector(null, onSelectResume);
    await waitFor(() => expect(result.current.resumes).toHaveLength(1));

    act(() => result.current.toggleSelect('r1'));

    expect(onSelectResume).toHaveBeenCalledWith('r1');
  });

  it('toggleSelect deselects the currently-selected id (click-same-to-deselect)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [mockResume()] })),
    );
    const onSelectResume = vi.fn();
    const { result } = renderUseResumeSelector('r1', onSelectResume);
    await waitFor(() => expect(result.current.resumes).toHaveLength(1));

    act(() => result.current.toggleSelect('r1'));

    expect(onSelectResume).toHaveBeenCalledWith(null);
  });

  it('self-heals by clearing a selection that no longer exists in the fetched list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [mockResume({ id: 'r2' })],
      })),
    );
    const onSelectResume = vi.fn();
    renderUseResumeSelector('stale-id', onSelectResume);

    await waitFor(() => expect(onSelectResume).toHaveBeenCalledWith(null));
  });

  it('does not clear a selection that is still present in the fetched list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [mockResume({ id: 'r1' })],
      })),
    );
    const onSelectResume = vi.fn();
    const { result } = renderUseResumeSelector('r1', onSelectResume);

    await waitFor(() => expect(result.current.resumes).toHaveLength(1));
    expect(onSelectResume).not.toHaveBeenCalled();
  });
});
