/**
 * @file Test render helpers with app providers.
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'

import { Toaster } from '@/components/ui/sonner'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

/** Renders with a QueryClient (no retries) and a Router, like in the real app. */
export function renderWithProviders(ui: ReactElement, { route = '/', ...options }: Options = {}) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}

/**
 * Renders `element` as the page at `path` inside a data router, so tests can check navigation and URL changes
 * through `router.state.location`. Any other path renders an empty placeholder.
 */
export function renderPage(
  element: ReactElement,
  { path, route }: { path: string; route: string },
) {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(
    [
      { path, element },
      { path: '*', element: <p>other page</p> },
    ],
    { initialEntries: [route] },
  )
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>,
  )
  return { router, queryClient, ...utils }
}
