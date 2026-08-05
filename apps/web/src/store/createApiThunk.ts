import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Wraps createAsyncThunk's try/catch/rejectWithValue boilerplate for thunks
 * that call `fetch` and expect a non-ok response to mean failure.
 */
export function createApiThunk<Returned, ThunkArg = void>(
  typePrefix: string,
  fetcher: (arg: ThunkArg) => Promise<Returned>,
  fallbackMessage: string,
) {
  return createAsyncThunk(
    typePrefix,
    async (arg: ThunkArg, { rejectWithValue }) => {
      try {
        return await fetcher(arg);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : fallbackMessage;
        return rejectWithValue(message);
      }
    },
  );
}
