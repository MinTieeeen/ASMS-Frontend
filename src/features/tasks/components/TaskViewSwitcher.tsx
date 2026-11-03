/**
 * @file Switches the task tab between the table, the board, the month calendar and the Gantt chart (F05.08,
 *   F05.11).
 * @author MinhTien
 * @version 1.2.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { CalendarDays, GanttChart, type LucideIcon, Rows3, SquareKanban } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { TASK_VIEWS, type TaskView } from '../hooks/useTaskListParams'

const ICON: Record<TaskView, LucideIcon> = {
  list: Rows3,
  board: SquareKanban,
  calendar: CalendarDays,
  gantt: GanttChart,
}

interface TaskViewSwitcherProps {
  view: TaskView
  onChange: (view: TaskView) => void
  /** Views offered on this page, in order */
  views?: readonly TaskView[]
}

export function TaskViewSwitcher({ view, onChange, views = TASK_VIEWS }: TaskViewSwitcherProps) {
  const { t } = useTranslation('tasks')
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={0}
      value={view}
      // Radix sends an empty value when the active item is pressed again; keep the current view
      onValueChange={(value) => {
        const next = views.find((item) => item === value)
        if (next) onChange(next)
      }}
      aria-label={t('view.label')}
    >
      {views.map((item) => {
        const Icon = ICON[item]
        return (
          <ToggleGroupItem key={item} value={item} className="gap-1.5 px-3">
            <Icon aria-hidden />
            {t(`view.${item}`)}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
