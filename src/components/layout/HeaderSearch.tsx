/**
 * @file Search in the app header (design "LAYOUT · Bố cục chung", marker 3): a 380 px box with the Ctrl K hint from
 *   1024 px up, an icon button below that opens the same box in a popover.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { Search } from 'lucide-react'
import { type FormEvent, type Ref, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks'

// TODO(M3): search groups, tasks and members; until then the box only takes the query
export function HeaderSearch() {
  const { t } = useTranslation()
  const isWide = useMediaQuery('(min-width: 1024px)')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Ctrl K (Cmd K on macOS) jumps to the search from anywhere
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      if (inputRef.current) inputRef.current.focus()
      else setIsPopoverOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (isWide) return <SearchBox inputRef={inputRef} />

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9" aria-label={t('search.label')}>
          <Search className="size-4.5" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(380px,calc(100vw-2rem))] p-2">
        {/* Radix moves the focus to the field when the popover opens */}
        <SearchBox />
      </PopoverContent>
    </Popover>
  )
}

interface SearchBoxProps {
  inputRef?: Ref<HTMLInputElement>
}

function SearchBox({ inputRef }: SearchBoxProps) {
  const { t } = useTranslation()
  const submit = (event: FormEvent) => event.preventDefault()

  return (
    <form role="search" onSubmit={submit} className="relative w-95 max-w-full">
      <Search
        className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        className="h-9 bg-background pr-16 pl-9"
      />
      <kbd className="pointer-events-none absolute top-2 right-2 inline-flex h-5 items-center rounded-sm border bg-background px-1.5 font-mono text-[11px] text-muted-foreground">
        Ctrl K
      </kbd>
    </form>
  )
}
