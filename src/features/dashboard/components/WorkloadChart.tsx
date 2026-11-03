/**
 * @file Column chart of the student's deadlines over the next 14 days: one hue, hairline grid, the busiest day
 *   labelled directly, a tooltip on hover and focus, a table for screen readers. Each column selects its day in the
 *   deadline calendar.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const PLOT_HEIGHT_PX = 160
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

interface WorkloadChartProps {
  workload: { day: string; count: number }[]
  selectedDay: string
  onSelectDay: (day: string) => void
}

export function WorkloadChart({ workload, selectedDay, onSelectDay }: WorkloadChartProps) {
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation()
  const max = Math.max(1, ...workload.map((item) => item.count))
  const ticks = [...new Set([max, Math.round(max / 2), 0])]
  const peak = workload.reduce((best, item) => (item.count > best.count ? item : best), { day: '', count: 0 })
  const dateOf = (day: string) => {
    const date = parseISO(day)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('workload.title')}</CardTitle>
        <CardDescription>{t('workload.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Top margin leaves room for the peak label above the tallest column */}
        <div className="mt-4 flex gap-2">
          <div className="relative w-6 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums" style={{ height: PLOT_HEIGHT_PX }} aria-hidden>
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick / max) * 100}%` }}>
                {tick}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: PLOT_HEIGHT_PX }}>
              {ticks.map((tick) => (
                <span key={tick} aria-hidden className="absolute inset-x-0 h-px bg-border" style={{ top: `${(1 - tick / max) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end gap-0.5">
                {workload.map((item) => {
                  const isSelected = item.day === selectedDay
                  const label = t('workload.column', { date: dateOf(item.day), count: item.count })
                  return (
                    <Tooltip key={item.day}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={label}
                          aria-pressed={isSelected}
                          onClick={() => onSelectDay(item.day)}
                          className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-sm outline-none focus-visible:shadow-focus"
                        >
                          <span
                            className={cn(
                              'relative w-full max-w-7 rounded-t-lg transition-colors',
                              item.count > 0 ? 'bg-primary group-hover:bg-primary/80' : 'bg-border',
                              isSelected && 'ring-2 ring-foreground ring-offset-2 ring-offset-card',
                            )}
                            // Bar heights are data, the one truly dynamic style
                            style={{ height: item.count > 0 ? `${(item.count / max) * 100}%` : 2 }}
                          >
                            {item.day === peak.day && peak.count > 0 && (
                              <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-[11px] font-semibold">
                                {peak.count}
                              </span>
                            )}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
            <div className="mt-1.5 flex gap-0.5" aria-hidden>
              {workload.map((item, index) => {
                const date = parseISO(item.day)
                return (
                  <span key={item.day} className={cn('flex min-w-0 flex-1 flex-col items-center text-[10px] leading-3 text-muted-foreground', item.day === selectedDay && 'font-semibold text-foreground')}>
                    <span>{index === 0 ? t('workload.today') : tCommon(`calendar.weekday.${WEEKDAY_KEYS[date.getDay()] ?? 'mon'}`)}</span>
                    <span className="tabular-nums">{date.getDate()}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {peak.count > 0 ? t('workload.peak', { date: dateOf(peak.day), count: peak.count }) : t('workload.empty')}
        </p>
        <table className="sr-only">
          <caption>{t('workload.table')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('workload.date')}</th>
              <th scope="col">{t('workload.count')}</th>
            </tr>
          </thead>
          <tbody>
            {workload.map((item) => (
              <tr key={item.day}>
                <td>{dateOf(item.day)}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
