import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMockStore } from '@/mocks'
import { renderPage } from '@/test/render'

import GroupTasksPage from './GroupTasksPage'

function renderTasks(search = '') {
  return renderPage(<GroupTasksPage />, {
    path: '/groups/:groupId/tasks',
    route: `/groups/g1/tasks${search}`,
  })
}

const taskOf = (id: string) => useMockStore.getState().tasks.find((item) => item.id === id)

/** The test setup reports every media query as false, i.e. a phone; this makes `min-width` queries match */
function desktopScreen() {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

describe('GroupTasksPage (M05)', () => {
  beforeEach(() => useMockStore.getState().resetDemo())
  afterEach(() => vi.restoreAllMocks())

  it('lists open tasks by default and every task with status=all (F05.09)', () => {
    const { unmount } = renderTasks()
    const table = screen.getByRole('table', { name: 'Danh sách công việc' })
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Mã',
      'Công việc',
      'Trạng thái',
      'Ưu tiên',
      'Người phụ trách',
      'Giai đoạn',
      'Bắt đầu',
      'Hạn chót',
    ])
    expect(within(table).getByText('Thiết kế lược đồ CSDL')).toBeInTheDocument()
    expect(within(table).queryByText('Phỏng vấn 3 chủ trọ khu Linh Trung')).not.toBeInTheDocument()
    unmount()

    renderTasks('?status=all')
    expect(screen.getByText('Phỏng vấn 3 chủ trọ khu Linh Trung')).toBeInTheDocument()
  })

  it('opens the task detail from the list and keeps the filters in the URL', async () => {
    const { router } = renderTasks('?q=csdl')

    await userEvent.click(screen.getByRole('link', { name: /Thiết kế lược đồ CSDL/ }))

    expect(await screen.findByRole('dialog', { name: /#5 Thiết kế lược đồ CSDL/ })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=csdl&task=t5')
  })

  it('lets the leader approve a task waiting for review (UC09 step 3)', async () => {
    renderTasks('?task=t5')

    const sheet = await screen.findByRole('dialog')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Duyệt' }))

    expect(taskOf('t5')?.status).toBe('done')
  })

  it('requires a reason to return a task', async () => {
    renderTasks('?task=t5')

    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Trả lại' }))
    const dialog = await screen.findByRole('dialog', { name: 'Trả lại #5' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Trả lại' }))
    expect(within(dialog).getByText('Không được để trống.')).toBeInTheDocument()

    await userEvent.type(within(dialog).getByLabelText('Lý do'), 'Thiếu bảng sự cố')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Trả lại' }))
    expect(taskOf('t5')?.status).toBe('in_progress')
  })

  it('asks for a result before submitting for review when the group requires it (UC09 step 2)', async () => {
    renderTasks()

    await userEvent.click(screen.getByRole('button', { name: 'Đổi trạng thái của #7' }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Chờ duyệt' }))
    const dialog = await screen.findByRole('dialog', { name: 'Gửi duyệt #7' })
    await userEvent.type(within(dialog).getByLabelText('Kết quả'), 'Đã xong sơ đồ C4')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Gửi duyệt' }))

    expect(taskOf('t7')?.status).toBe('in_review')
    expect(useMockStore.getState().comments.some((item) => item.taskId === 't7' && item.body === 'Đã xong sơ đồ C4')).toBe(true)
  })

  it('switches views and keeps the choice in the URL', async () => {
    const { router } = renderTasks()

    await userEvent.click(screen.getByRole('radio', { name: 'Gantt' }))

    expect(router.state.location.search).toBe('?view=gantt')
    expect(screen.getByRole('region', { name: 'Biểu đồ Gantt công việc' })).toBeInTheDocument()
  })

  it('shows the board with one column per status and no status filter (F05.03)', () => {
    renderTasks('?view=board')

    const board = screen.getByRole('region', { name: 'Bảng công việc theo trạng thái' })
    const columns = within(board).getAllByRole('region')
    expect(columns.map((column) => column.getAttribute('aria-label'))).toEqual([
      'Chưa làm',
      'Đang làm',
      'Chờ duyệt',
      'Hoàn thành',
    ])
    const review = within(board).getByRole('region', { name: 'Chờ duyệt' })
    expect(within(review).getByText('Thiết kế lược đồ CSDL')).toBeInTheDocument()
    expect(within(board).getByRole('button', { name: 'Kéo #5 sang cột khác' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Trạng thái' })).not.toBeInTheDocument()
  })

  it('moves a card with its status menu, the keyboard alternative to dragging', async () => {
    renderTasks('?view=board')

    await userEvent.click(screen.getByRole('button', { name: 'Đổi trạng thái của #7' }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Chưa làm' }))

    const todo = screen.getByRole('region', { name: 'Chưa làm' })
    expect(within(todo).getByText('Thiết kế kiến trúc hệ thống')).toBeInTheDocument()
  })

  it('records the planned start date of a new task', async () => {
    renderTasks()

    await userEvent.click(screen.getByRole('button', { name: 'Thêm công việc' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Tiêu đề'), 'Viết test API hóa đơn')
    await userEvent.type(within(dialog).getByLabelText('Ngày bắt đầu'), '2026-11-10')
    await userEvent.type(within(dialog).getByLabelText('Hạn chót'), '2026-11-05')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm công việc' }))
    expect(await within(dialog).findByText('Hạn chót không được trước ngày bắt đầu.')).toBeInTheDocument()

    await userEvent.clear(within(dialog).getByLabelText('Hạn chót'))
    await userEvent.type(within(dialog).getByLabelText('Hạn chót'), '2026-11-20')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm công việc' }))

    const created = useMockStore.getState().tasks.find((item) => item.title === 'Viết test API hóa đơn')
    // 00:00 on 10/11 in Vietnam
    expect(created?.startAt).toBe('2026-11-09T17:00:00.000Z')
  })

  it('draws each dated task on the Gantt chart under its phase (F05.11)', () => {
    renderTasks('?view=gantt')

    const chart = screen.getByRole('region', { name: 'Biểu đồ Gantt công việc' })
    expect(within(chart).getByText('Thiết kế')).toBeInTheDocument()
    expect(within(chart).getByRole('link', { name: /#7 Thiết kế kiến trúc hệ thống/ })).toBeInTheDocument()
  })

  it('shows tasks on their due day in the month calendar', () => {
    useMockStore.getState().updateTask('t7', { dueAt: new Date().toISOString() })
    desktopScreen()
    renderTasks('?view=calendar')

    const grid = screen.getByRole('grid')
    expect(within(grid).getByRole('link', { name: /Thiết kế kiến trúc hệ thống/ })).toHaveAttribute(
      'href',
      '/groups/g1/tasks?view=calendar&task=t7',
    )
  })

  it('adds a task and shows it in the list (UC08)', async () => {
    renderTasks()

    await userEvent.click(screen.getByRole('button', { name: 'Thêm công việc' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm công việc' }))
    expect(await within(dialog).findByText('Nhập tiêu đề công việc.')).toBeInTheDocument()

    await userEvent.type(within(dialog).getByLabelText('Tiêu đề'), 'Viết test API hóa đơn')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm công việc' }))

    expect(await screen.findByText('Viết test API hóa đơn')).toBeInTheDocument()
  })
})
