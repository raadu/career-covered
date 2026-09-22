import '@testing-library/jest-dom'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Default 1000ms waitFor timeout is too tight under heavy parallel test-file
// load (many suites competing for CPU), causing intermittent flakes that
// pass in isolation. Widen it suite-wide rather than patching each call site.
configure({ asyncUtilTimeout: 3000 })

// Polyfill ResizeObserver for jsdom (used by TemplateSelector)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill matchMedia for jsdom (used by useIsMobile) — defaults to "not
// mobile" so existing tests keep exercising table/desktop behavior unless a
// test explicitly overrides window.matchMedia to simulate a phone viewport.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Automatically cleanup after each test to prevent memory leaks and state bleed
afterEach(() => {
  cleanup()
})
