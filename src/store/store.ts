import { configureStore, type Middleware } from '@reduxjs/toolkit';
import coverLetterReducer from './coverLetterSlice';
import { apiSlice } from './apiSlice';

// Middleware to persist state
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  if (
    typeof action === 'object' && 
    action !== null && 
    'type' in action &&
    ((action as { type: string }).type.startsWith('coverLetter/setTemplate') ||
     (action as { type: string }).type.startsWith('coverLetter/setApiKey'))
  ) {
    localStorage.setItem('cl_template', state.coverLetter.template);
    localStorage.setItem('cl_apiKey', state.coverLetter.apiKey);
    localStorage.setItem('cl_model', state.coverLetter.model);
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    coverLetter: coverLetterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
