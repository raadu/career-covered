import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import coverLetterReducer from 'store/coverLetterSlice';
import authReducer from 'store/authSlice';
import { apiSlice } from 'store/apiSlice';
import { setLocalStorageItem } from 'utils/localStorageUtils';

// Middleware to persist state
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  if (typeof action === 'object' && action !== null && 'type' in action) {
    const type = (action as { type: string }).type;
    if (
      type.startsWith('coverLetter/setTemplate') ||
      type.startsWith('coverLetter/setApiKey')
    ) {
      setLocalStorageItem('template', state.coverLetter.template);
      setLocalStorageItem('apiKey', state.coverLetter.apiKey);
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    coverLetter: coverLetterReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
