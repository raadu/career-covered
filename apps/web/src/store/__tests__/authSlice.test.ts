import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, {
  fetchCurrentUser,
  logoutUser,
  updateProfileLinks,
  setAuthModalOpen,
  setUser,
  setAuthLoading,
  setAuthError,
  type AuthState,
  type UserProfile,
} from 'store/authSlice';

const createInitialState = (overrides?: Partial<AuthState>): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authError: null,
  ...overrides,
});

const mockProfile: UserProfile = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
};

describe('authSlice reducers', () => {
  it('opens and closes the auth modal', () => {
    const state = authReducer(createInitialState(), setAuthModalOpen(true));
    expect(state.isAuthModalOpen).toBe(true);

    const closed = authReducer(state, setAuthModalOpen(false));
    expect(closed.isAuthModalOpen).toBe(false);
  });

  it('sets the user and marks the session as authenticated', () => {
    const state = authReducer(
      createInitialState({ isLoading: true, authError: 'stale error' }),
      setUser(mockProfile),
    );

    expect(state.user).toEqual(mockProfile);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.authError).toBeNull();
  });

  it('clears the user and marks the session as unauthenticated when set to null', () => {
    const state = authReducer(
      createInitialState({ user: mockProfile, isAuthenticated: true }),
      setUser(null),
    );

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets the loading flag', () => {
    const state = authReducer(
      createInitialState({ isLoading: false }),
      setAuthLoading(true),
    );
    expect(state.isLoading).toBe(true);
  });

  it('sets and clears the auth error', () => {
    const withError = authReducer(
      createInitialState(),
      setAuthError('Something went wrong'),
    );
    expect(withError.authError).toBe('Something went wrong');

    const cleared = authReducer(withError, setAuthError(null));
    expect(cleared.authError).toBeNull();
  });
});

describe('authSlice extraReducers', () => {
  describe('fetchCurrentUser', () => {
    it('sets isLoading on pending', () => {
      const state = authReducer(
        createInitialState({ isLoading: false }),
        fetchCurrentUser.pending('req'),
      );
      expect(state.isLoading).toBe(true);
    });

    it('stores the user and clears errors on fulfilled', () => {
      const state = authReducer(
        createInitialState({ authError: 'old error', isLoading: true }),
        fetchCurrentUser.fulfilled(mockProfile, 'req'),
      );
      expect(state.user).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.authError).toBeNull();
    });

    it('clears the user and auth flag on rejected without surfacing an error', () => {
      const state = authReducer(
        createInitialState({
          user: mockProfile,
          isAuthenticated: true,
          isLoading: true,
        }),
        fetchCurrentUser.rejected(new Error('Not authenticated'), 'req'),
      );
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.authError).toBeNull();
    });
  });

  describe('logoutUser', () => {
    it('sets isLoading on pending', () => {
      const state = authReducer(
        createInitialState({ isLoading: false }),
        logoutUser.pending('req'),
      );
      expect(state.isLoading).toBe(true);
    });

    it('clears the user on fulfilled', () => {
      const state = authReducer(
        createInitialState({
          user: mockProfile,
          isAuthenticated: true,
          isLoading: true,
        }),
        logoutUser.fulfilled(undefined, 'req'),
      );
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('surfaces the error message on rejected', () => {
      const state = authReducer(
        createInitialState({ isLoading: true }),
        logoutUser.rejected(new Error('Logout failed'), 'req', undefined, 'Logout failed'),
      );
      expect(state.isLoading).toBe(false);
      expect(state.authError).toBe('Logout failed');
    });
  });

  describe('updateProfileLinks', () => {
    it('replaces state.user wholesale on fulfilled, not a partial merge', () => {
      const staleUser: UserProfile = {
        ...mockProfile,
        linkedinUrl: 'https://linkedin.com/in/old',
        githubUrl: 'https://github.com/old',
      };
      const freshUser: UserProfile = {
        ...mockProfile,
        linkedinUrl: 'https://linkedin.com/in/new',
        githubUrl: null,
        websiteUrl: 'https://new.dev',
        contactEmail: 'new@example.com',
      };

      const state = authReducer(
        createInitialState({ user: staleUser, isAuthenticated: true }),
        updateProfileLinks.fulfilled(freshUser, 'req', {}),
      );

      expect(state.user).toEqual(freshUser);
    });
  });
});

describe('authSlice thunks', () => {
  const dispatch = vi.fn();
  const getState = vi.fn();

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('fetchCurrentUser', () => {
    it('resolves with the profile when the request succeeds', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response);

      const action = await fetchCurrentUser()(dispatch, getState, undefined);

      expect(fetch).toHaveBeenCalledWith('/auth/me');
      expect(action.type).toBe('auth/fetchCurrentUser/fulfilled');
      expect(action.payload).toEqual(mockProfile);
    });

    it('rejects with a fixed message when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

      const action = await fetchCurrentUser()(dispatch, getState, undefined);

      expect(action.type).toBe('auth/fetchCurrentUser/rejected');
      expect(action.payload).toBe('Not authenticated');
    });

    it('rejects with the fallback message when fetch throws a non-Error value', async () => {
      vi.mocked(fetch).mockRejectedValue('network down');

      const action = await fetchCurrentUser()(dispatch, getState, undefined);

      expect(action.type).toBe('auth/fetchCurrentUser/rejected');
      expect(action.payload).toBe('Failed to fetch user profile');
    });
  });

  describe('logoutUser', () => {
    it('resolves when the request succeeds', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

      const action = await logoutUser()(dispatch, getState, undefined);

      expect(fetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
      expect(action.type).toBe('auth/logoutUser/fulfilled');
    });

    it('rejects with a fixed message when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

      const action = await logoutUser()(dispatch, getState, undefined);

      expect(action.type).toBe('auth/logoutUser/rejected');
      expect(action.payload).toBe('Logout failed');
    });
  });

  describe('updateProfileLinks', () => {
    it('sends a PATCH with the given links and resolves with the updated profile', async () => {
      const updatedProfile: UserProfile = {
        ...mockProfile,
        linkedinUrl: 'https://linkedin.com/in/x',
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedProfile),
      } as Response);

      const action = await updateProfileLinks({
        linkedinUrl: 'https://linkedin.com/in/x',
      })(dispatch, getState, undefined);

      expect(fetch).toHaveBeenCalledWith('/api/profile/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: 'https://linkedin.com/in/x' }),
      });
      expect(action.type).toBe('auth/updateProfileLinks/fulfilled');
      expect(action.payload).toEqual(updatedProfile);
    });

    it('rejects with a fixed message when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

      const action = await updateProfileLinks({})(dispatch, getState, undefined);

      expect(action.type).toBe('auth/updateProfileLinks/rejected');
      expect(action.payload).toBe('Failed to update profile links');
    });

    it('rejects with the fallback message when fetch throws a non-Error value', async () => {
      vi.mocked(fetch).mockRejectedValue('network down');

      const action = await updateProfileLinks({})(dispatch, getState, undefined);

      expect(action.type).toBe('auth/updateProfileLinks/rejected');
      expect(action.payload).toBe('Failed to update profile links');
    });
  });
});
