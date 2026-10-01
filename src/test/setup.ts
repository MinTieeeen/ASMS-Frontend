/**
 * @file Global Vitest setup: jest-dom matchers, i18n, MSW and a fresh auth store per test.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import '@testing-library/jest-dom/vitest'
import '@/lib/i18n'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { useAuthStore } from '@/stores/auth.store'

import { server } from './msw/server'

const initialAuthState = useAuthStore.getState()

// jsdom has no ResizeObserver; Radix primitives (checkbox, dialog...) measure elements with it
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom has no matchMedia; the toaster and theme code query it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

// A request without a handler is a test bug: fail loudly instead of hitting the network
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  useAuthStore.setState(initialAuthState, true)
})

afterAll(() => server.close())
