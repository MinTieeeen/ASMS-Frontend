/**
 * @file Toolbar of a task list (F05.09): search by title, then status, group, assignee and phase filters (each shown
 *   only when the page passes its options) and "overdue only".
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Member, MockUser, Phase } from '@/mocks'

import type { StatusFilter, TaskListState } from '../hooks/useTaskListParams'
import { TASK_STATUSES } from '../utils/task-abilities'

/** Select value for "no filter" (Radix Select needs a non-empty value) */
const ANY = 'any'

interface TaskFiltersProps {
  state: TaskListState
  onChange: (changes: Partial<TaskListState>) => void
  /** The board shows every status as a column, so it has no status filter */
  hasStatusFilter?: boolean
  /** Shows the group filter ("My tasks") */
  groups?: { id: string; name: string }[]
  /** Shows the assignee filter (one group) */
  members?: Member[]
  users?: Record<string, MockUser>
  /** Shows the phase filter (one group) */
  phases?: Phase[]
}

export function TaskFilters({ state, onChange, hasStatusFilter = true, groups, members, users, phases }: TaskFiltersProps) {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-48 flex-1">
        <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={state.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder={t('filter.search')}
          aria-label={t('filter.search')}
          className="pl-9"
        />
      </div>
      {hasStatusFilter && (
        <FilterSelect label={t('filter.status')} value={state.status} onChange={(value) => onChange({ status: value as StatusFilter })} className="w-40">
          <SelectItem value="open">{t('filter.open')}</SelectItem>
          <SelectItem value="all">{t('filter.all')}</SelectItem>
          {TASK_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {tCommon(`domain.taskStatus.${status}`)}
            </SelectItem>
          ))}
        </FilterSelect>
      )}
      {groups && (
        <FilterSelect label={t('filter.group')} value={state.group ?? ANY} onChange={(value) => onChange({ group: value === ANY ? null : value })}>
          <SelectItem value={ANY}>{t('filter.allGroups')}</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </FilterSelect>
      )}
      {members && (
        <FilterSelect label={t('filter.assignee')} value={state.assignee ?? ANY} onChange={(value) => onChange({ assignee: value === ANY ? null : value })}>
          <SelectItem value={ANY}>{t('filter.assignee')}: {t('filter.all')}</SelectItem>
          <SelectItem value="me">{t('filter.me')}</SelectItem>
          <SelectItem value="none">{t('filter.unassigned')}</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.userId} value={member.userId}>
              {users?.[member.userId]?.fullName ?? '?'}
            </SelectItem>
          ))}
        </FilterSelect>
      )}
      {phases && (
        <FilterSelect label={t('filter.phase')} value={state.phase ?? ANY} onChange={(value) => onChange({ phase: value === ANY ? null : value })}>
          <SelectItem value={ANY}>{t('filter.phase')}: {t('filter.all')}</SelectItem>
          <SelectItem value="none">{t('filter.noPhase')}</SelectItem>
          {phases.map((phase) => (
            <SelectItem key={phase.id} value={phase.id}>
              {phase.name}
            </SelectItem>
          ))}
        </FilterSelect>
      )}
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          id="filter-overdue"
          checked={state.overdueOnly}
          onCheckedChange={(checked) => onChange({ overdueOnly: checked === true })}
        />
        <Label htmlFor="filter-overdue" className="font-normal">
          {t('filter.overdue')}
        </Label>
      </div>
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  children: ReactNode
}

function FilterSelect({ label, value, onChange, className = 'w-44', children }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
