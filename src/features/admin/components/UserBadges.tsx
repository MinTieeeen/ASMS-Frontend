/**
 * @file Status and role labels of an account (screen conventions of Module 2): pending yellow, active green, locked
 *   red; User grey, Admin outlined.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useTranslation } from 'react-i18next'

import type {
  AdminUserSummaryResponseStatus,
  AdminUserSummaryResponseSystemRole,
} from '@/api/generated/models'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_DOT: Record<AdminUserSummaryResponseStatus, string> = {
  PENDING_ACTIVATION: 'bg-status-review',
  ACTIVE: 'bg-status-done',
  LOCKED: 'bg-destructive',
}

const STATUS_STYLE: Record<AdminUserSummaryResponseStatus, string> = {
  PENDING_ACTIVATION: 'bg-highlight-soft text-highlight-text',
  ACTIVE: 'bg-accent text-accent-foreground',
  LOCKED: 'bg-destructive-soft text-destructive-text',
}

export function StatusBadge({ status }: { status: AdminUserSummaryResponseStatus }) {
  const { t } = useTranslation('admin')
  return (
    <Badge className={cn('gap-1.5', STATUS_STYLE[status])}>
      <span className={cn('size-1.5 rounded-full', STATUS_DOT[status])} aria-hidden />
      {t(`users.status.${status}`)}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: AdminUserSummaryResponseSystemRole }) {
  const { t } = useTranslation('admin')
  return role === 'ADMIN' ? (
    <Badge variant="outline" className="border-primary text-primary">
      {t('users.role.ADMIN')}
    </Badge>
  ) : (
    <Badge variant="secondary">{t('users.role.USER')}</Badge>
  )
}

/** "You" next to the signed-in Admin's own row */
export function YouBadge() {
  const { t } = useTranslation('admin')
  return <Badge variant="secondary">{t('users.you')}</Badge>
}
