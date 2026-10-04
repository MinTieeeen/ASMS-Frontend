/**
 * @file Opens the profile card of a user from their avatar or name (SCR-USER-03): a popover from 768 px, the
 *   /users/{userId} page below. Module Nhóm wraps member names and avatars with it.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ROUTES } from '@/config/routes'
import { useIsMobile } from '@/hooks'

import { ProfileCard } from './ProfileCard'

interface ProfilePopoverProps {
  userId: string
  /** Accessible name of the trigger, e.g. the user's full name */
  fullName: string
  /** What is clicked: an avatar, a name... rendered inside a button or a link */
  children: ReactNode
  className?: string
}

export function ProfilePopover({ userId, fullName, children, className }: ProfilePopoverProps) {
  const { t } = useTranslation('profile')
  const isMobile = useIsMobile()
  const label = t('card.label', { name: fullName })

  if (isMobile) {
    return (
      <Link to={ROUTES.userProfile(userId)} aria-label={label} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <Popover>
      <PopoverTrigger aria-label={label} className={className}>
        {children}
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-80 rounded-xl p-5" aria-label={label}>
        <ProfileCard userId={userId} />
      </PopoverContent>
    </Popover>
  )
}
