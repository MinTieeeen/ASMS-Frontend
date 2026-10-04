/**
 * @file Page-number pagination: "Showing 1–20 of 137", rows per page, previous / pages / next.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface PaginationProps {
  /** First page is 1 */
  page: number
  size: number
  totalItems: number
  totalPages: number
  pageSizes: readonly number[]
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

/** At most 7 buttons: first, last, the current page and its neighbours, with gaps */
function visiblePages(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b)
  return sorted.flatMap((value, index) =>
    index > 0 && value - (sorted[index - 1] ?? value) > 1 ? ['gap' as const, value] : [value],
  )
}

export function Pagination({
  page,
  size,
  totalItems,
  totalPages,
  pageSizes,
  onPageChange,
  onSizeChange,
}: PaginationProps) {
  const { t } = useTranslation()
  const from = totalItems === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, totalItems)

  return (
    <nav
      aria-label={t('pagination.label')}
      className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"
    >
      <div className="flex items-center gap-4 text-muted-foreground">
        <span>{t('pagination.range', { from, to, total: totalItems })}</span>
        <span className="flex items-center gap-2">
          {t('pagination.pageSize')}
          <Select value={String(size)} onValueChange={(value) => onSizeChange(Number(value))}>
            <SelectTrigger size="sm" className="w-18 bg-card" aria-label={t('pagination.pageSize')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('pagination.previous')}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          {visiblePages(page, totalPages).map((value, index) =>
            value === 'gap' ? (
              <span key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden>
                …
              </span>
            ) : (
              <Button
                key={value}
                variant={value === page ? 'outline' : 'ghost'}
                size="icon-sm"
                aria-label={t('pagination.page', { page: value })}
                aria-current={value === page ? 'page' : undefined}
                className={cn(value === page && 'bg-card font-semibold')}
                onClick={() => onPageChange(value)}
              >
                {value}
              </Button>
            ),
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('pagination.next')}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </nav>
  )
}
