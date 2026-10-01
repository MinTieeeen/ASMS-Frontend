import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'

import { GuestOnly, RequireAdmin, RequireAuth } from '@/app/router/guards'
import {
  apiUrl,
  problem,
  refreshOk,
  refreshUnauthorized,
  server,
  testUser,
} from '@/test/msw/server'

import { AuthBootstrap } from './AuthBootstrap'

function LocationProbe({ name }: { name: string }) {
  const location = useLocation()
  return <p>{`${name} ${location.pathname}${location.search}`}</p>
}

function renderApp(initialPath: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      {
        element: <AuthBootstrap />,
        children: [
          {
            element: <GuestOnly />,
            children: [{ path: '/login', element: <LocationProbe name="login-page" /> }],
          },
          {
            element: <RequireAuth />,
            children: [
              { path: '/dashboard', element: <LocationProbe name="dashboard-page" /> },
              {
                element: <RequireAdmin />,
                children: [{ path: '/admin', element: <LocationProbe name="admin-page" /> }],
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AuthBootstrap and route guards', () => {
  it('FR-AUTH-08: restores the session before showing a protected page', async () => {
    server.use(refreshOk())

    renderApp('/dashboard')

    expect(await screen.findByText('dashboard-page /dashboard')).toBeInTheDocument()
    expect(screen.queryByText(/login-page/)).not.toBeInTheDocument()
  })

  it('sends a visitor without session to /login with the page as redirect', async () => {
    server.use(refreshUnauthorized())

    renderApp('/dashboard?tab=2')

    expect(
      await screen.findByText('login-page /login?redirect=%2Fdashboard%3Ftab%3D2'),
    ).toBeInTheDocument()
  })

  it('FR-AUTH-05: sends a signed-in user away from the login page to their home', async () => {
    server.use(refreshOk())

    renderApp('/login')

    expect(await screen.findByText('dashboard-page /dashboard')).toBeInTheDocument()
  })

  it('shows the 403 page when a USER opens an admin page', async () => {
    server.use(refreshOk())

    renderApp('/admin')

    expect(
      await screen.findByRole('heading', { name: 'Bạn không có quyền truy cập trang này' }),
    ).toBeInTheDocument()
  })

  it('lets an ADMIN open admin pages', async () => {
    server.use(refreshOk('admin-token', { ...testUser, systemRole: 'ADMIN' }))

    renderApp('/admin')

    expect(await screen.findByText('admin-page /admin')).toBeInTheDocument()
  })

  it('goes to login with MSG-06 when the account was locked', async () => {
    server.use(mswHttp.post(apiUrl('/auth/refresh'), () => problem(403, 'AUTH_ACCOUNT_LOCKED')))

    renderApp('/dashboard')

    expect(await screen.findByText('login-page /login?msg=account_locked')).toBeInTheDocument()
  })

  it('SCR-AUTH-08 S02: offers to retry when the server cannot be reached', async () => {
    server.use(mswHttp.post(apiUrl('/auth/refresh'), () => HttpResponse.error()))

    renderApp('/dashboard')

    expect(
      await screen.findByRole('heading', { name: 'Không thể kết nối máy chủ' }),
    ).toBeInTheDocument()

    server.use(refreshOk())
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByText('dashboard-page /dashboard')).toBeInTheDocument()
  })
})
