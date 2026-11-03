/**
 * @file All global providers (theme, query client, tooltip, toaster).
 * @author MinhTien
 * @version 1.0.1
 * @since 2026-09-26
 * @modified 2026-11-03
 */

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'

/** Add new global providers here, never in main.tsx. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="asms-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
