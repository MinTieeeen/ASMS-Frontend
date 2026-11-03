import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppHeader } from '@/components/layout/AppHeader'
import { renderWithProviders } from '@/test/render'

describe('AppHeader (LAYOUT)', () => {
  it('Ctrl K opens the search and focuses it (narrow screen: icon button)', async () => {
    renderWithProviders(<AppHeader isSidebarWide onOpenMobileNav={() => {}} />)

    await userEvent.keyboard('{Control>}k{/Control}')

    await waitFor(() => expect(screen.getByRole('searchbox', { name: 'Tìm kiếm' })).toHaveFocus())
  })

  it('has no notification button while in-app notifications are out of scope (F10.01)', () => {
    renderWithProviders(<AppHeader isSidebarWide onOpenMobileNav={() => {}} />)

    expect(screen.queryByRole('button', { name: 'Thông báo' })).not.toBeInTheDocument()
  })
})
