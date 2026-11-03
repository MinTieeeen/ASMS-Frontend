/**
 * @file How the student's open tasks split across To do, In progress and Awaiting review: one tall segmented bar
 *   with the count printed on each part that fits, and a legend that always names each part with its count, so
 *   the split never relies on color alone.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { useTranslation } from 'react-i18next'

import { StatusDot } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/utils/format'

import type { OpenStatus } from '../utils/dashboard-data'

const ORDER: OpenStatus[] = ['todo', 'in_progress', 'in_review']
const FILL: Record<OpenStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-doing',
  in_review: 'bg-status-review',
}
/** Below this share a part is too narrow for its number, which stays in the legend */
const LABEL_MIN_SHARE = 0.12

export function StatusSplit({ split }: { split: Record<OpenStatus, number> }) {
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation()
  const total = ORDER.reduce((sum, status) => sum + split[status], 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('status.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('status.empty')}</p>
        ) : (
          <>
            <p className="font-heading text-4xl font-semibold">
              {total}
              <span className="ml-2 text-sm font-normal text-muted-foreground">{t('status.unit')}</span>
            </p>
            {/* The legend below carries every value, so the bar itself is hidden from screen readers */}
            <div className="flex h-10 gap-0.5" aria-hidden>
              {ORDER.filter((status) => split[status] > 0).map((status) => {
                const share = split[status] / total
                return (
                  <span
                    key={status}
                    className={cn('flex items-center justify-center first:rounded-l-lg last:rounded-r-lg', FILL[status])}
                    // Each part's width is its share of the open tasks
                    style={{ flexGrow: split[status], flexBasis: 0 }}
                  >
                    {share >= LABEL_MIN_SHARE && (
                      <span className="text-sm font-semibold text-background">{split[status]}</span>
                    )}
                  </span>
                )
              })}
            </div>
            <ul className="flex flex-col gap-2">
              {ORDER.map((status) => (
                <li key={status} className="flex items-center gap-2 text-sm">
                  <StatusDot status={status} />
                  <span className="flex-1">{tCommon(`domain.taskStatus.${status}`)}</span>
                  <span className="font-medium tabular-nums">{split[status]}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                    {formatPercent(split[status] / total)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
