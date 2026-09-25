/**
 * @file Root component: global providers + router.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { RouterProvider } from 'react-router'

import { AppProviders } from './providers/AppProviders'
import { router } from './router'

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
