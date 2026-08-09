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
