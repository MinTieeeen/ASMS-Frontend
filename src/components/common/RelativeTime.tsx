/**
 * @file A past moment as "just now", "5 minutes ago"... (full date beyond 7 days), with the full date and time on
 *   hover (screen conventions of Module 2).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useTranslation } from 'react-i18next'

import { formatDateTime, toRelativeTime } from '@/utils/date'

export function RelativeTime({ value, className }: { value: string; className?: string }) {
  const { t } = useTranslation()
  const relative = toRelativeTime(value)
  const label = (() => {
    switch (relative.unit) {
      case 'justNow':
        return t('time.justNow')
      case 'minutes':
        return t('time.minutesAgo', { count: relative.count })
      case 'hours':
        return t('time.hoursAgo', { count: relative.count })
      case 'days':
        return t('time.daysAgo', { count: relative.count })
      default:
        return relative.text
    }
  })()

  return (
    <time dateTime={value} title={formatDateTime(value)} className={className}>
      {label}
    </time>
  )
}
