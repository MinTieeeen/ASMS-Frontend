/**
 * @file Notification bell in the app header (design "LAYOUT · Bố cục chung", marker 4).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { Bell, BellOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface HeaderNotificationsProps {
  /** Unread count; the red dot shows only when it is above zero */
  unreadCount?: number
}

// TODO(GĐ2): load notifications and the unread count from the notification module
export function HeaderNotifications({ unreadCount = 0 }: HeaderNotificationsProps) {
  const { t } = useTranslation()
  const hasUnread = unreadCount > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={
            hasUnread
              ? t('notifications.labelUnread', { count: unreadCount })
              : t('notifications.label')
          }
        >
          <Bell className="size-4.5" aria-hidden />
          {hasUnread && (
            <span
              className="absolute top-1.75 right-2 size-2 rounded-full bg-destructive shadow-[0_0_0_2px_var(--card)]"
              aria-hidden
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b px-4 py-3 text-sm font-semibold">{t('notifications.title')}</p>
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BellOff className="size-5" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">{t('notifications.empty')}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
