/**
 * @file School picker of SCR-USER-01 (9) and SCR-USER-05 (9): a combobox with a search box over the active schools
 *   (API-USER-21, BR-USER-03).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useListActiveSchools } from '@/api/generated/endpoints/catalogs/catalogs'
import type { SchoolRefResponse } from '@/api/generated/models'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toSearchKey } from '@/utils/search'

/** The list changes rarely; the backend also answers 304 through its ETag */
const SCHOOLS_STALE_TIME_MS = 5 * 60_000

interface SchoolComboboxProps {
  id?: string
  /** The school currently saved, shown even when it was deactivated since */
  value: SchoolRefResponse | null
  onChange: (school: SchoolRefResponse | null) => void
  disabled?: boolean
  invalid?: boolean
  'aria-describedby'?: string
}

/** Each option shows the full name, then "short name · code"; the filter ignores accents and case. */
export function SchoolCombobox({
  id,
  value,
  onChange,
  disabled,
  invalid,
  'aria-describedby': describedBy,
}: SchoolComboboxProps) {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const [open, setOpen] = useState(false)
  const schools = useListActiveSchools({
    query: { enabled: open, staleTime: SCHOOLS_STALE_TIME_MS },
  })

  const select = (school: SchoolRefResponse | null) => {
    onChange(school)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
          className="h-10 w-full justify-between bg-card px-3 font-normal aria-invalid:border-destructive"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value ? value.name : t('school.placeholder')}
            {value && !value.active && (
              <span className="ml-1 text-muted-foreground">{t('school.inactive')}</span>
            )}
          </span>
          <ChevronsUpDown className="size-4 opacity-60" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-85 p-1.5">
        <Command
          filter={(itemValue, search) =>
            toSearchKey(itemValue).includes(toSearchKey(search)) ? 1 : 0
          }
        >
          <CommandInput placeholder={t('school.search')} />
          <CommandList aria-label={t('school.label')} className="max-h-65">
            {schools.isError ? (
              <div className="flex items-center justify-between gap-2 px-2.5 py-3 text-sm">
                <span className="text-destructive-text">{t('school.loadFailed')}</span>
                <Button size="sm" variant="outline" onClick={() => void schools.refetch()}>
                  {tCommon('action.retry')}
                </Button>
              </div>
            ) : (
              <>
                {schools.isSuccess && <CommandEmpty>{t('school.empty')}</CommandEmpty>}
                <CommandGroup>
                  {schools.data?.items.map((school) => (
                    <CommandItem
                      key={school.id}
                      // Searched text: name, short name and code
                      value={`${school.name} ${school.shortName ?? ''} ${school.code}`}
                      onSelect={() => select(school)}
                      className="gap-2.5 px-2.5 py-2"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={cn(value?.id === school.id && 'font-semibold')}>
                          {school.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {[school.shortName, school.code].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      {value?.id === school.id && (
                        <Check className="size-4 text-primary" aria-hidden />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
        <div className="mt-1 flex flex-col gap-1 border-t px-2.5 pt-2 pb-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 self-start text-muted-foreground"
              onClick={() => select(null)}
            >
              <X aria-hidden />
              {t('school.clear')}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">{t('school.footer')}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
