import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestStore } from '../../../../tests/test-utils';
import { useSignOut } from '../useSignOut';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({ showToast: mockShowToast }));

const mockLogout = vi.hoisted(() => vi.fn());
vi.mock('store/authSlice', async () => {
  const actual = await vi.importActual('store/authSlice');
  return { ...actual, logoutUser: () => mockLogout };
});

const renderUseSignOut = () => {
  const store = createTestStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useSignOut(), { wrapper });
};

describe('useSignOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with the confirm dialog closed', () => {
    const { result } = renderUseSignOut();
    expect(result.current.isConfirmOpen).toBe(false);
  });

  it('opens the confirm dialog on request without signing out', () => {
    const { result } = renderUseSignOut();
    act(() => result.current.requestSignOut());
    expect(result.current.isConfirmOpen).toBe(true);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('closes the dialog on cancel without signing out', () => {
    const { result } = renderUseSignOut();
    act(() => result.current.requestSignOut());
    act(() => result.current.cancelSignOut());
    expect(result.current.isConfirmOpen).toBe(false);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('signs out, closes the dialog and shows the goodbye toast on confirm', async () => {
    mockLogout.mockReturnValue({ unwrap: () => Promise.resolve() });
    const { result } = renderUseSignOut();

    act(() => result.current.requestSignOut());
    act(() => result.current.confirmSignOut());

    expect(mockLogout).toHaveBeenCalledOnce();
    expect(result.current.isConfirmOpen).toBe(false);
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining("You're logged out"),
        { type: 'info' },
      ),
    );
  });

  it('shows an error toast when sign-out fails', async () => {
    mockLogout.mockReturnValue({
      unwrap: () => Promise.reject(new Error('network')),
    });
    const { result } = renderUseSignOut();

    act(() => result.current.confirmSignOut());

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith('Sign out failed', {
        type: 'error',
      }),
    );
  });
});
