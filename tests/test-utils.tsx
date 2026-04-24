import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import coverLetterReducer from 'store/coverLetterSlice';
import { apiSlice } from 'store/apiSlice';
import type { RootState } from 'store';

const rootReducer = combineReducers({
    coverLetter: coverLetterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
});

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Create a re-usable store factory so the type is always inferred correctly
const createTestStore = (preloadedState?: DeepPartial<RootState>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState: preloadedState as Partial<RootState>,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware),
    });

type TestStore = ReturnType<typeof createTestStore>;

/**
 * Custom render function that wraps the component with a Redux Provider.
 * Uses a real store instance configured for testing.
 */
import { MemoryRouter } from 'react-router-dom';

function renderWithProviders(
    ui: ReactElement,
    {
        preloadedState,
        store = createTestStore(preloadedState),
        ...renderOptions
    }: {
        preloadedState?: DeepPartial<RootState>;
        store?: TestStore;
    } & Omit<RenderOptions, 'queries'> = {}
) {
    function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
        return (
            <Provider store={store}>
                <MemoryRouter>{children}</MemoryRouter>
            </Provider>
        );
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { renderWithProviders };
