/**
 * @file Toolbar of "My groups" (F02.02, F02.03): keyword, semester, grouping and "show ended semesters".
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { GroupBy, GroupListState } from '../hooks/useGroupListParams'

const ALL = 'all'
const GROUP_BY: GroupBy[] = ['semester', 'subject', 'none']

interface GroupFiltersProps {
  state: GroupListState
  semesters: string[]
  onChange: (changes: Partial<GroupListState>) => void
}

export function GroupFilters({ state, semesters, onChange }: GroupFiltersProps) {
  const { t } = useTranslation('groups')

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={state.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder={t('list.searchPlaceholder')}
          aria-label={t('list.searchLabel')}
          className="bg-card pl-9"
        />
      </div>
      <Select value={state.semester ?? ALL} onValueChange={(value) => onChange({ semester: value === ALL ? null : value })}>
        <SelectTrigger className="w-48 bg-card" aria-label={t('list.semesterFilter')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('list.allSemesters')}</SelectItem>
          {semesters.map((semester) => (
            <SelectItem key={semester} value={semester}>
              {semester}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={state.groupBy}
        onValueChange={(value) => {
          const next = GROUP_BY.find((item) => item === value)
          if (next) onChange({ groupBy: next })
        }}
        aria-label={t('list.groupBy')}
        className="bg-card"
      >
        {GROUP_BY.map((value) => (
          <ToggleGroupItem key={value} value={value} className="px-3">
            {t(`list.groupByOption.${value}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex items-center gap-2 sm:ml-auto">
        <Switch id="show-ended" checked={state.showEnded} onCheckedChange={(checked) => onChange({ showEnded: checked })} />
        <Label htmlFor="show-ended" className="text-sm font-normal">
          {t('list.showEnded')}
        </Label>
      </div>
    </div>
  )
}
