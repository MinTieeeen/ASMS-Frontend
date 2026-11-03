/**
 * @file Archive or restore the group (F03.09, BR09), leader only: an archived group becomes read-only for everyone.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import { Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Group, useMockStore } from '@/mocks'

export function ArchiveSettings({ group }: { group: Group }) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const setArchived = useMockStore((state) => state.setArchived)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const isArchived = group.status === 'archived'

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>{t('settings.archive.title')}</CardTitle>
        <CardDescription>{t('settings.archive.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isArchived ? (
          <Button
            variant="outline"
            onClick={() => {
              setArchived(group.id, false)
              toast.success(t('settings.archive.restored'))
            }}
          >
            <ArchiveRestore aria-hidden />
            {t('settings.archive.restore')}
          </Button>
        ) : (
          <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
            <Archive aria-hidden />
            {t('settings.archive.archive')}
          </Button>
        )}
      </CardContent>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t('settings.archive.confirmTitle', { name: group.name })}
        description={t('settings.archive.confirmDescription')}
        confirmLabel={t('settings.archive.archive')}
        cancelLabel={tCommon('action.cancel')}
        onConfirm={() => {
          setArchived(group.id, true)
          toast.success(t('settings.archive.archived'))
          setIsConfirmOpen(false)
        }}
      />
    </Card>
  )
}
