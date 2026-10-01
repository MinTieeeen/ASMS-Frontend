/**
 * @file Application route tree (React Router data router).
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import { LoadingScreen } from '@/components/common'
import { AppLayout, AuthLayout } from '@/components/layout'
import { ROUTES } from '@/config/routes'
import { AccountMenu, AuthBootstrap } from '@/features/auth'

import { GuestOnly, RequireAdmin, RequireAuth } from './guards'

/**
 * Lazy-loads a page per route to split the bundle (NFR02).
 * Pages export a default component; this helper adapts it to a React Router route module.
 */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

/**
 * AuthBootstrap is the root element: no route renders before the session is restored (FR-AUTH-08).
 * Guest pages sit under GuestOnly, app pages under RequireAuth, admin pages under RequireAdmin too.
 */
export const router = createBrowserRouter([
  {
    element: <AuthBootstrap />,
    HydrateFallback: LoadingScreen,
    children: [
      {
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.login, lazy: page(() => import('@/features/auth/pages/LoginPage')) },
              {
                path: ROUTES.forgotPassword,
                lazy: page(() => import('@/features/auth/pages/ForgotPasswordPage')),
              },
              {
                path: ROUTES.resetPassword,
                lazy: page(() => import('@/features/auth/pages/ResetPasswordPage')),
              },
              {
                path: ROUTES.activate,
                lazy: page(() => import('@/features/auth/pages/ActivatePage')),
              },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout accountMenu={<AccountMenu />} />,
            children: [
              { path: ROUTES.home, element: <Navigate to={ROUTES.dashboard} replace /> },
              {
                path: ROUTES.dashboard,
                lazy: page(() => import('@/features/dashboard/pages/DashboardPage')),
              },
              {
                path: ROUTES.securitySettings,
                lazy: page(() => import('@/features/auth/pages/SecuritySettingsPage')),
              },
              {
                element: <RequireAdmin />,
                children: [
                  // TODO(F12.01): /admin becomes the admin overview; until then it opens user management
                  { path: ROUTES.admin, element: <Navigate to={ROUTES.adminUsers} replace /> },
                  {
                    path: ROUTES.adminUsers,
                    lazy: page(() => import('@/features/admin/pages/AdminUsersPage')),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', lazy: page(() => import('./NotFoundPage')) },
    ],
  },
])
