import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createApiThunk } from 'store/createApiThunk';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string | null;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authError: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true to check session first
  isAuthModalOpen: false,
  authError: null,
};

// ─── Async Actions ───────────────────────────────────────────────────────────

export const fetchCurrentUser = createApiThunk<UserProfile>(
  'auth/fetchCurrentUser',
  async () => {
    const response = await fetch('/auth/me');
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    return (await response.json()) as UserProfile;
  },
  'Failed to fetch user profile',
);

export const logoutUser = createApiThunk<void>(
  'auth/logoutUser',
  async () => {
    const response = await fetch('/auth/logout', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },
  'Logout failed',
);

export interface ProfileLinksPayload {
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
}

export const updateProfileLinks = createApiThunk<
  UserProfile,
  ProfileLinksPayload
>(
  'auth/updateProfileLinks',
  async (data) => {
    const response = await fetch('/api/profile/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile links');
    }
    return (await response.json()) as UserProfile;
  },
  'Failed to update profile links',
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.authError = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.authError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.authError = null;
        },
      )
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
      })
      // Update Profile Links
      .addCase(
        updateProfileLinks.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.user = action.payload;
        },
      );
  },
});

export const { setAuthModalOpen, setUser, setAuthLoading, setAuthError } =
  authSlice.actions;
export default authSlice.reducer;
