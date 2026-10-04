/**
 * @file Search box and filters of the Admin user list, SCR-USER-04 (4)–(7).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ListUsersRole, ListUsersStatusItem } from '@/api/generated/models'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks'

import type { UserListState } from '../hooks/useUserListParams'

const SEARCH_DELAY_MS = 300
const STATUSES: ListUsersStatusItem[] = ['PENDING_ACTIVATION', 'ACTIVE', 'LOCKED']
const ALL_ROLES = 'ALL'

interface UserFiltersProps {
  state: UserListState
  hasFilters: boolean
  onChange: (changes: Partial<UserListState>) => void
}

export function UserFilters({ state, hasFilters, onChange }: UserFiltersProps) {
  const { t } = useTranslation('admin')
  const [keyword, setKeyword] = useState(state.q)
  const debounced = useDebounce(keyword, SEARCH_DELAY_MS)
  const isTooShort = keyword.trim().length === 1

  // Typing updates the URL 300 ms after the last key (A2)
  useEffect(() => {
    if (debounced !== state.q) onChange({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the debounced value triggers a search
  }, [debounced])

  // Back/forward or "clear filters" change the URL: follow it (adjusting state while rendering, not in an effect)
  const [urlKeyword, setUrlKeyword] = useState(state.q)
  if (urlKeyword !== state.q) {
    setUrlKeyword(state.q)
    setKeyword(state.q)
  }

  const toggleStatus = (status: ListUsersStatusItem, checked: boolean) =>
    onChange({
      status: checked
        ? [...state.status, status]
        : state.status.filter((value) => value !== status),
    })

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-85">
          <Search
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t('users.search.placeholder')}
            aria-label={t('users.search.label')}
            aria-describedby={isTooShort ? 'user-search-hint' : undefined}
            maxLength={100}
            className="bg-card pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {keyword && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1 right-1"
              aria-label={t('users.search.clear')}
              onClick={() => setKeyword('')}
            >
              <X aria-hidden />
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-card">
              {state.status.length > 0
                ? t('users.filter.statusCount', { count: state.status.length })
                : t('users.filter.status')}
              <ChevronDown className="opacity-60" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={state.status.includes(status)}
                onCheckedChange={(checked) => toggleStatus(status, checked === true)}
                onSelect={(event) => event.preventDefault()}
              >
                {t(`users.status.${status}`)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={state.role ?? ALL_ROLES}
          onValueChange={(value) =>
            onChange({ role: value === ALL_ROLES ? null : (value as ListUsersRole) })
          }
        >
          <SelectTrigger className="w-44 bg-card" aria-label={t('users.filter.role')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>{t('users.filter.allRoles')}</SelectItem>
            <SelectItem value="USER">{t('users.role.USER')}</SelectItem>
            <SelectItem value="ADMIN">{t('users.role.ADMIN')}</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="link"
            className="px-1"
            onClick={() => onChange({ q: '', status: [], role: null })}
          >
            {t('users.filter.clear')}
          </Button>
        )}
      </div>
      {isTooShort && (
        <p id="user-search-hint" className="text-xs text-muted-foreground">
          {t('users.search.tooShort')}
        </p>
      )}
    </div>
  )
}
