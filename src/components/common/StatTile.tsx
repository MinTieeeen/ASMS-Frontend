/**
 * @file KPI tile of a dashboard: icon, big number, label and an optional hint or link.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'default' | 'danger' | 'attention' | 'success' | 'info'

const TONE: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  danger: 'bg-destructive-soft text-destructive-text',
  attention: 'bg-highlight-soft text-highlight-text',
  success: 'bg-accent text-accent-foreground',
  info: 'bg-info-soft text-info',
}

interface StatTileProps {
  icon: LucideIcon
  value: ReactNode
  label: string
  hint?: ReactNode
  tone?: Tone
  className?: string
}

export function StatTile({ icon: Icon, value, label, hint, tone = 'default', className }: StatTileProps) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs', className)}>
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', TONE[tone])}>
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-heading text-2xl leading-7 font-semibold tabular-nums">{value}</p>
        <p className="text-[13px] text-muted-foreground">{label}</p>
        {hint && <div className="mt-1 text-xs">{hint}</div>}
      </div>
    </div>
  )
}
