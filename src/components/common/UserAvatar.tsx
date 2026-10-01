/**
 * @file User avatar: photo when available, otherwise initials on a tone derived from the user id (SCR-AUTH-07).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/utils/format'

/** Design system avatar tones (component Avatar): jade, yellow, blue, neutral. */
const TONES = [
  'bg-accent text-accent-foreground',
  'bg-highlight-soft text-highlight-text',
  'bg-info-soft text-info',
  'bg-secondary text-secondary-foreground',
] as const

interface UserAvatarProps {
  /** Stable key for the tone, normally the user id */
  userId: string
  fullName: string
  avatarUrl?: string | null
  /** Side in px */
  size?: number
  className?: string
}

export function UserAvatar({ userId, fullName, avatarUrl, size = 36, className }: UserAvatarProps) {
  return (
    <Avatar
      className={cn('shrink-0', className)}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}
    >
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback className={cn('font-semibold', toneOf(userId))} aria-hidden>
        {initialsOf(fullName)}
      </AvatarFallback>
    </Avatar>
  )
}

function toneOf(key: string): string {
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length] ?? TONES[0]
}
