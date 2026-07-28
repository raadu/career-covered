import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Polyfill ResizeObserver for jsdom (used by TemplateSelector)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Automatically cleanup after each test to prevent memory leaks and state bleed
afterEach(() => {
  cleanup()
})
