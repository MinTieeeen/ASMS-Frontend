/**
 * @file Labelled progress bar (section 6.1): percentage plus "done / total" so the number is never hidden in color.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/utils/format'

interface ProgressMeterProps {
  /** 0-1 */
  ratio: number
  label?: string
  /** e.g. "8/12 tasks" */
  detail?: string
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressMeter({ ratio, label, detail, size = 'md', className }: ProgressMeterProps) {
  const percent = formatPercent(ratio)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || detail) && (
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-muted-foreground tabular-nums">{detail ?? percent}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Progress
          value={Math.round(ratio * 100)}
          aria-label={label ? `${label}: ${percent}` : percent}
          className={size === 'sm' ? 'h-1.5' : 'h-2'}
        />
        {!label && !detail && (
          <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
            {percent}
          </span>
        )}
      </div>
    </div>
  )
}
