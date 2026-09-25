/**
 * @file Application route tree (React Router data router).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import { LoadingScreen } from '@/components/common'
import { AppLayout, AuthLayout } from '@/components/layout'
import { ROUTES } from '@/config/routes'

import { GuestOnly, RequireAuth } from './guards'

/**
 * Lazy-loads a page per route to split the bundle (NFR02).
 * Pages export a default component; this helper adapts it to a React Router route module.
 */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    HydrateFallback: LoadingScreen,
    children: [
      {
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.login, lazy: page(() => import('@/features/auth/pages/LoginPage')) },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.home, element: <Navigate to={ROUTES.dashboard} replace /> },
              {
                path: ROUTES.dashboard,
                lazy: page(() => import('@/features/dashboard/pages/DashboardPage')),
              },
            ],
          },
        ],
      },
      { path: '*', lazy: page(() => import('./NotFoundPage')) },
    ],
  },
])
