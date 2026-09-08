import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
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
