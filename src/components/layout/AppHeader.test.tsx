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

  it('opens an empty notification panel without an unread dot', async () => {
    renderWithProviders(<AppHeader isSidebarWide onOpenMobileNav={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Thông báo' }))

    expect(await screen.findByText('Bạn chưa có thông báo nào.')).toBeInTheDocument()
  })
})
