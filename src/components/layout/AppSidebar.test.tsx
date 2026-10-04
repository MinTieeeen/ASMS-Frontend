import { screen, within } from '@testing-library/react'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth.store'
import { testUser } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'

function renderSidebar(role: 'USER' | 'ADMIN', route = '/dashboard') {
  useAuthStore.getState().setSession('access-token', { ...testUser, systemRole: role })
  return renderWithProviders(<AppSidebar />, { route })
}

describe('AppSidebar (LAYOUT)', () => {
  it('shows only the workspace group to a User', () => {
    renderSidebar('USER')

    expect(screen.getByText('Không gian làm việc')).toBeInTheDocument()
    expect(screen.queryByText('Quản trị')).not.toBeInTheDocument()
    expect(screen.queryByText('Cấu hình')).not.toBeInTheDocument()
  })

  it('adds the admin and configuration groups for an Admin', () => {
    renderSidebar('ADMIN')

    expect(screen.getByText('Quản trị')).toBeInTheDocument()
    expect(screen.getByText('Cấu hình')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Người dùng' })).toHaveAttribute('href', '/admin/users')
  })

  it('marks one current item and keeps "Settings" selected on settings pages', () => {
    renderSidebar('USER', '/settings/security')

    expect(screen.getByRole('link', { name: 'Cài đặt' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Trang chủ' })).not.toHaveAttribute('aria-current')
  })

  it('shows pages not built yet as "coming soon", not as links', () => {
    renderSidebar('USER')

    const calendar = screen.getByText('Lịch').closest('[aria-disabled="true"]') as HTMLElement
    expect(within(calendar).getByText('Sắp có')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Lịch/ })).not.toBeInTheDocument()
  })
})

describe('AppSidebar rail', () => {
  it('keeps every item styled and centered when collapsed', () => {
    useAuthStore.getState().setSession('access-token', { ...testUser, systemRole: 'ADMIN' })
    renderWithProviders(
      <TooltipProvider>
        <AppSidebar isRail />
      </TooltipProvider>,
      { route: '/admin/users' },
    )

    const users = screen.getByRole('link', { name: 'Người dùng' })
    expect(users).toHaveAttribute('aria-current', 'page')
    expect(users).toHaveClass('justify-center', 'bg-accent')
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveClass('justify-center')
  })
})
