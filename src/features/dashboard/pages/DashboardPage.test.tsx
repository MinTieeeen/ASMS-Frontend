import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMockStore } from '@/mocks'
import { useAuthStore } from '@/stores/auth.store'
import { testUser } from '@/test/msw/server'
import { renderPage } from '@/test/render'
import { toDateInputValue } from '@/utils/date'

import DashboardPage from './DashboardPage'

const DAY_MS = 86_400_000

function renderDashboard() {
  useAuthStore.getState().setSession('access-token', { ...testUser, fullName: 'Nguyễn Minh Tiến' })
  return renderPage(<DashboardPage />, { path: '/dashboard', route: '/dashboard' })
}

/** "d/M" label of the day `days` from today in the user time zone, as the chart prints it */
function dayLabel(days: number) {
  const [, month, day] = toDateInputValue(new Date(Date.now() + days * DAY_MS).toISOString()).split('-')
  return `${Number(day)}/${Number(month)}`
}

describe('DashboardPage (UC11)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())

  it('greets the student by given name and shows the headline numbers', () => {
    renderDashboard()

    expect(screen.getByRole('heading', { level: 1, name: /Tiến$/ })).toBeInTheDocument()
    for (const label of ['Việc đang mở', 'Quá hạn', 'Đến hạn trong 7 ngày', 'Hoàn thành 7 ngày qua']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('gives the deadline chart a table for screen readers with one row per day', () => {
    renderDashboard()

    const table = screen.getByRole('table', { name: 'Số việc đến hạn theo ngày' })
    expect(within(table).getAllByRole('row')).toHaveLength(15)
  })

  it('selects a day in the calendar from a chart column and lists its deadlines', async () => {
    useMockStore.getState().updateTask('t7', { dueAt: new Date(Date.now() + 2 * DAY_MS).toISOString() })
    renderDashboard()

    const column = screen.getByRole('button', { name: new RegExp(`^${dayLabel(2)}: \\d+ việc$`) })
    await userEvent.click(column)

    expect(column).toHaveAttribute('aria-pressed', 'true')
    const day = screen.getByRole('heading', { name: /^Hạn ngày/ }).closest('section') as HTMLElement
    expect(within(day).getByText('Thiết kế kiến trúc hệ thống')).toBeInTheDocument()
  })

  it('names every status with its count next to the segmented bar', () => {
    renderDashboard()

    const card = screen.getByText('Việc đang mở theo trạng thái').closest('[data-slot="card"]') as HTMLElement
    for (const status of ['Chưa làm', 'Đang làm', 'Chờ duyệt']) {
      expect(within(card).getByText(status)).toBeInTheDocument()
    }
  })

  it('lists my groups with a link to each workspace', () => {
    renderDashboard()

    const table = screen.getByRole('table', { name: 'Các nhóm của tôi' })
    expect(within(table).getByRole('link', { name: 'Nhóm 3 – Phòng trọ thông minh' })).toHaveAttribute(
      'href',
      '/groups/g1',
    )
  })
})
