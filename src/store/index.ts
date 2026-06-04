import { configureStore, type Middleware } from '@reduxjs/toolkit';
import coverLetterReducer from 'store/coverLetterSlice';
import { apiSlice } from 'store/apiSlice';

// Middleware to persist state
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  if (
    typeof action === 'object' && 
    action !== null && 
    'type' in action
  ) {
    const type = (action as { type: string }).type;
    if (type.startsWith('coverLetter/setTemplate') || type.startsWith('coverLetter/setApiKey')) {
      localStorage.setItem('cl_template', state.coverLetter.template);
      localStorage.setItem('cl_apiKey', state.coverLetter.apiKey);
      localStorage.setItem('cl_model', state.coverLetter.model);
    }
    if (
      type.startsWith('coverLetter/addTemplate') ||
      type.startsWith('coverLetter/removeTemplate') ||
      type.startsWith('coverLetter/renameTemplate')
    ) {
      localStorage.setItem('cl_saved_templates', JSON.stringify(state.coverLetter.savedTemplates));
    }
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
