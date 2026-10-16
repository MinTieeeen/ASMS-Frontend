/**
 * @file Overlapping avatars of a group's members with a "+N" counter.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { cn } from '@/lib/utils'

import { UserAvatar } from './UserAvatar'

interface AvatarStackProps {
  people: { id: string; fullName: string }[]
  max?: number
  size?: number
  /** Accessible summary, e.g. "5 members" */
  label: string
  className?: string
}

export function AvatarStack({ people, max = 4, size = 28, label, className }: AvatarStackProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <div className={cn('flex items-center', className)} role="img" aria-label={label}>
      {shown.map((person) => (
        <UserAvatar
          key={person.id}
          userId={person.id}
          fullName={person.fullName}
          size={size}
          className="-ml-1.5 ring-2 ring-card first:ml-0"
        />
      ))}
      {rest > 0 && (
        <span
          className="-ml-1.5 flex items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground ring-2 ring-card"
          style={{ width: size, height: size }}
          aria-hidden
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
