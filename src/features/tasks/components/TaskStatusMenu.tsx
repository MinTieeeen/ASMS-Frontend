/**
 * @file Inline status menu of a task (F05.03, UC09), the keyboard alternative to dragging on the board. Offers only
 *   the statuses the student may pick; asks for a result first when the group requires one (UC09 step 2).
 * @author MinhTien
 * @version 1.1.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { StatusDot, TaskStatusBadge } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Group, Task, TaskStatus } from '@/mocks'

import { useTaskStatusChange } from '../hooks/useTaskStatusChange'

interface TaskStatusMenuProps {
  task: Task
  group: Pick<Group, 'requireResultOnReview'>
  /** From taskAbilitiesOf; empty renders a plain badge */
  statuses: TaskStatus[]
}

export function TaskStatusMenu({ task, group, statuses }: TaskStatusMenuProps) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()
  const { changeStatus, resultDialog } = useTaskStatusChange(group)

  if (statuses.length <= 1) return <TaskStatusBadge status={task.status} />

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 gap-1.5 rounded-full px-2 text-xs" aria-label={t('status.change', { code: task.code })}>
            <StatusDot status={task.status} className="size-2" />
            {tCommon(`domain.taskStatus.${task.status}`)}
            <ChevronDown className="size-3" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={task.status}
            onValueChange={(value) => {
              const status = statuses.find((item) => item === value)
              if (status) changeStatus(task, status)
            }}
          >
            {statuses.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                <StatusDot status={status} />
                {tCommon(`domain.taskStatus.${status}`)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {resultDialog}
    </>
  )
}
