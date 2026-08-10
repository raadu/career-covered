import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createTestStore } from '../../../../tests/test-utils';
import { useResume } from '../useResume';
import type { Resume } from '../types';

// dnd-kit's real pointer-drag simulation isn't practical in jsdom (no
// official test helper, would need manual sensor/coordinate wiring) — so
// this tests the part that actually matters: reorderResumes's optimistic
// update, the exact payload it sends, and its rollback-on-failure path.
// ResumeGrid's onDragEnd is a thin wrapper (arrayMove + call this) around
// it, not independently interesting to test.

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

function renderUseResume() {
  const store = createTestStore({
    auth: { isAuthenticated: true, isLoading: false },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useResume(), { wrapper });
}

describe('useResume — reorder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
  });

  it('optimistically applies the new order, then replaces it with the server-returned order on success', async () => {
    const a = mockResume({ id: 'a', order: 0 });
    const b = mockResume({ id: 'b', order: 1 });
    const serverOrder = [
      { ...b, order: 0 },
      { ...a, order: 1 },
    ];

    let resolvePost!: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === '/api/resumes' && !init) {
          return { ok: true, json: async () => [a, b] };
        }
        if (String(input) === '/api/resumes/reorder') {
          await postPromise;
          return { ok: true, json: async () => serverOrder };
        }
        throw new Error(`unexpected fetch: ${input}`);
      }),
    );

    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => {
      result.current.reorderResumes([b, a]);
    });

    // Optimistic: the new order is reflected immediately, before the
    // network request resolves.
    expect(result.current.data.map((r) => r.id)).toEqual(['b', 'a']);

    resolvePost(undefined);
    await waitFor(() => {
      expect(result.current.data).toEqual(serverOrder);
    });
  });

  it('rolls back to the pre-reorder state and toasts an error on failure', async () => {
    const a = mockResume({ id: 'a', order: 0 });
    const b = mockResume({ id: 'b', order: 1 });

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === '/api/resumes' && !init) {
          return { ok: true, json: async () => [a, b] };
        }
        if (String(input) === '/api/resumes/reorder') {
          return { ok: false, json: async () => ({ message: 'nope' }) };
        }
        throw new Error(`unexpected fetch: ${input}`);
      }),
    );

    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    await act(async () => {
      await result.current.reorderResumes([b, a]);
    });

    expect(result.current.data.map((r) => r.id)).toEqual(['a', 'b']);
    expect(mockShowToast).toHaveBeenCalledWith(
      'Failed to reorder resumes',
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('sends the full ordered id list as the reorder payload', async () => {
    const a = mockResume({ id: 'a', order: 0 });
    const b = mockResume({ id: 'b', order: 1 });
    const c = mockResume({ id: 'c', order: 2 });

    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === '/api/resumes' && !init) {
          return { ok: true, json: async () => [a, b, c] };
        }
        if (String(input) === '/api/resumes/reorder') {
          return { ok: true, json: async () => [c, a, b] };
        }
        throw new Error(`unexpected fetch: ${input}`);
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    await act(async () => {
      await result.current.reorderResumes([c, a, b]);
    });

    const reorderCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === '/api/resumes/reorder',
    );
    expect(reorderCall?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ ids: ['c', 'a', 'b'] }),
    });
  });
});

describe('useResume — pagination', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
  });

  const threeResumes = [
    mockResume({ id: 'a', name: 'A', order: 0 }),
    mockResume({ id: 'b', name: 'B', order: 1 }),
    mockResume({ id: 'c', name: 'C', order: 2 }),
  ];

  it('defaults to a single page holding every resume', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => threeResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    expect(result.current.pageCount).toBe(1);
    expect(result.current.pagedData).toHaveLength(3);
  });

  it('handlePageSizeChange slices pagedData and resets to page 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => threeResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => {
      result.current.handlePageSizeChange(1);
    });

    expect(result.current.pageCount).toBe(3);
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.pagedData.map((r) => r.id)).toEqual(['a']);
  });

  it('handlePageChange moves to the requested page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => threeResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => {
      result.current.handlePageSizeChange(1);
    });
    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.pageIndex).toBe(2);
    expect(result.current.pagedData.map((r) => r.id)).toEqual(['c']);
  });

  it('reorderPagedResumes merges the reordered page slice back into the full list', async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === '/api/resumes' && !init) {
          return { ok: true, json: async () => threeResumes };
        }
        if (String(input) === '/api/resumes/reorder') {
          const body = JSON.parse(String(init?.body)) as { ids: string[] };
          return {
            ok: true,
            json: async () =>
              body.ids.map((id, i) => ({
                ...threeResumes.find((r) => r.id === id)!,
                order: i,
              })),
          };
        }
        throw new Error(`unexpected fetch: ${input}`);
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => {
      result.current.handlePageSizeChange(1);
    });
    act(() => {
      result.current.handlePageChange(1); // page 1 (0-indexed) holds only 'b'
    });

    await act(async () => {
      result.current.reorderPagedResumes([mockResume({ id: 'b', order: 1 })]);
    });

    await waitFor(() => {
      const reorderCall = fetchMock.mock.calls.find(
        ([url]) => String(url) === '/api/resumes/reorder',
      );
      expect(reorderCall).toBeDefined();
      const body = JSON.parse(String(reorderCall![1]?.body)) as {
        ids: string[];
      };
      // 'b' is the only item on its page — merging a 1-item reordered page
      // slice back in changes nothing about the surrounding order, so the
      // full payload should still be every id, unchanged.
      expect(body.ids).toEqual(['a', 'b', 'c']);
    });
  });
});

describe('useResume — selection and batch delete', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
  });

  const twoResumes = [
    mockResume({ id: 'a', name: 'A', order: 0 }),
    mockResume({ id: 'b', name: 'B', order: 1 }),
  ];

  it('defaults to nothing selected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => twoResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    expect(result.current.allSelected).toBe(false);
    expect(result.current.someSelected).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('toggleSelect adds and removes a single id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => twoResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.toggleSelect('a'));
    expect(result.current.selectedIds.has('a')).toBe(true);
    expect(result.current.someSelected).toBe(true);
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.toggleSelect('a'));
    expect(result.current.selectedIds.has('a')).toBe(false);
  });

  it('toggleSelectAll selects every row on the page, then clears on a second call', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => twoResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.toggleSelectAll());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedIds.size).toBe(2);

    act(() => result.current.toggleSelectAll());
    expect(result.current.allSelected).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('clearSelection empties the selection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => twoResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.toggleSelectAll());
    act(() => result.current.clearSelection());

    expect(result.current.selectedIds.size).toBe(0);
  });

  it('resets selection when the page changes', async () => {
    const threeResumes = [
      mockResume({ id: 'a', order: 0 }),
      mockResume({ id: 'b', order: 1 }),
      mockResume({ id: 'c', order: 2 }),
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => threeResumes })),
    );
    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => result.current.handlePageSizeChange(1));
    act(() => result.current.toggleSelect('a'));
    expect(result.current.selectedIds.size).toBe(1);

    act(() => result.current.handlePageChange(1));
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('handleBatchDelete deletes the selected ids and refetches', async () => {
    let deleted = false;
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === '/api/resumes' && !init) {
          return {
            ok: true,
            json: async () => (deleted ? [] : twoResumes),
          };
        }
        if (url === '/api/resumes/batch' && init?.method === 'DELETE') {
          deleted = true;
          expect(JSON.parse(String(init.body))).toEqual({
            ids: expect.arrayContaining(['a', 'b']),
          });
          return { ok: true, json: async () => ({}) };
        }
        throw new Error(`unexpected fetch: ${url}`);
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.toggleSelectAll());
    await act(async () => {
      await result.current.handleBatchDelete();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      '2 resumes removed',
      expect.objectContaining({ duration: 2000 }),
    );
    expect(result.current.showBatchConfirm).toBe(false);
    await waitFor(() => expect(result.current.data).toHaveLength(0));
  });

  it('shows an error toast when the batch delete request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === '/api/resumes' && !init) {
          return { ok: true, json: async () => twoResumes };
        }
        if (url === '/api/resumes/batch') {
          return { ok: false, json: async () => ({}) };
        }
        throw new Error(`unexpected fetch: ${url}`);
      }),
    );

    const { result } = renderUseResume();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.toggleSelect('a'));
    await act(async () => {
      await result.current.handleBatchDelete();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'Failed to delete resumes',
      expect.objectContaining({ type: 'error' }),
    );
  });
});
