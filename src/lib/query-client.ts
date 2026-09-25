/**
 * @file Shared TanStack Query client and default options.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@/types/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // NFR04 (before phase 3): refetch when the tab regains focus
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        // Never retry 4xx errors (forbidden, not found...)
        if (isApiError(error) && error.status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
