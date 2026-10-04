/**
 * @file Top of a page (design "LAYOUT · Bố cục chung", marker 7): H1 with an optional count, description, main
 *   button on the right.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-10-04
 */

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  /** Short fact next to the title, e.g. "137 users" on a list page */
  meta?: ReactNode
  description?: string
  /** Right-aligned actions (Create, Export...) */
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, meta, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-heading text-[28px] leading-9 font-semibold tracking-[-0.015em]">
            {title}
          </h1>
          {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
