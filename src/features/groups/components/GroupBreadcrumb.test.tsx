import { screen, within } from '@testing-library/react'

import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupOverviewPage from '../pages/GroupOverviewPage'
import { GroupBreadcrumb } from './GroupBreadcrumb'

function renderBreadcrumb(route: string) {
  const group = useMockStore.getState().groups.find((item) => item.id === 'g1')
  if (!group) throw new Error('seed group g1 is missing')
  renderPage(<GroupBreadcrumb group={group} />, { path: '/groups/:groupId/*', route })
  return within(screen.getByRole('navigation', { name: 'Đường dẫn trong nhóm' }))
}

describe('GroupBreadcrumb', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('ends with the group on the overview', () => {
    const nav = renderBreadcrumb('/groups/g1')

    expect(nav.getByRole('link', { name: 'Nhóm của tôi' })).toHaveAttribute('href', '/groups')
    expect(nav.getByText('Nhóm 3 – Phòng trọ thông minh')).toHaveAttribute('aria-current', 'page')
  })

  it('links the group and names the open tab', () => {
    const nav = renderBreadcrumb('/groups/g1/tasks')

    expect(nav.getByRole('link', { name: 'Nhóm 3 – Phòng trọ thông minh' })).toHaveAttribute('href', '/groups/g1')
    expect(nav.getByText('Công việc')).toHaveAttribute('aria-current', 'page')
  })

  it('leads back to the milestone list from a milestone', () => {
    const nav = renderBreadcrumb('/groups/g1/milestones/g1-m2')

    expect(nav.getByRole('link', { name: 'Mốc nộp' })).toHaveAttribute('href', '/groups/g1/milestones')
    expect(nav.getByText('Nộp tài liệu thiết kế (SDD)')).toHaveAttribute('aria-current', 'page')
  })
})

describe('GroupOverviewPage group information', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('shows subject, semester, lecturer and topic in the overview', () => {
    renderPage(<GroupOverviewPage />, { path: '/groups/:groupId', route: '/groups/g1' })

    const card = screen.getByText('Thông tin nhóm').closest('[data-slot="card"]') as HTMLElement
    expect(within(card).getByText(/^SE104 · /)).toBeInTheDocument()
    expect(within(card).getByText('Giảng viên hướng dẫn')).toBeInTheDocument()
    expect(within(card).getByText('Ứng dụng quản lý phòng trọ cho chủ nhà và người thuê')).toBeInTheDocument()
  })
})
