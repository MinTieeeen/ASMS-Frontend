/**
 * @file Account menu in the app header, SCR-AUTH-07 (UC-AUTH-03, FR-AUTH-10, FR-AUTH-11).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { LockKeyhole, LogOut, MonitorSmartphone, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { UserAvatar } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/config/routes'
import { selectIsAdmin, selectUser, useAuthStore } from '@/stores/auth.store'

import { useLogout } from '../hooks/useLogout'
import { LogoutAllDialog } from './LogoutAllDialog'

export function AccountMenu() {
  const { t } = useTranslation('auth')
  const user = useAuthStore(selectUser)
  const isAdmin = useAuthStore(selectIsAdmin)
  const { logoutThisDevice } = useLogout()
  const [isLogoutAllOpen, setIsLogoutAllOpen] = useState(false)

  if (!user) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('menu.open')}
          className="rounded-full outline-none focus-visible:shadow-focus data-[state=open]:shadow-focus"
        >
          <UserAvatar
            userId={user.id}
            fullName={user.fullName}
            avatarUrl={user.avatarUrl}
            size={36}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 rounded-xl p-1.5 shadow-lg"
          aria-label={t('menu.label')}
        >
          <DropdownMenuLabel className="flex items-center gap-3 px-2.5 pt-2.5 pb-3 font-normal">
            <UserAvatar
              userId={user.id}
              fullName={user.fullName}
              avatarUrl={user.avatarUrl}
              size={40}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold">{user.fullName}</span>
                {isAdmin && <Badge className="shrink-0">{t('menu.adminBadge')}</Badge>}
              </div>
              <span className="truncate text-[13px] leading-[18px] text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to={ROUTES.admin}>
                <ShieldCheck aria-hidden />
                {t('menu.adminPage')}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to={ROUTES.securitySettings}>
              <LockKeyhole aria-hidden />
              {t('menu.security')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void logoutThisDevice()}>
            <LogOut aria-hidden />
            {t('menu.logout')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive-text focus:text-destructive-text [&_svg]:text-current"
            onSelect={() => setIsLogoutAllOpen(true)}
          >
            <MonitorSmartphone aria-hidden />
            {t('menu.logoutAll')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutAllDialog open={isLogoutAllOpen} onOpenChange={setIsLogoutAllOpen} />
    </>
  )
}
