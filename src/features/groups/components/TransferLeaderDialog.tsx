/**
 * @file Transfer leadership (UC05): confirmed by typing the group name; the old leader becomes a deputy.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TransferLeaderDialogProps {
  groupName: string
  /** Null closes the dialog */
  target: { userId: string; fullName: string } | null
  onClose: () => void
  onConfirm: (userId: string) => void
}

export function TransferLeaderDialog({ groupName, target, onClose, onConfirm }: TransferLeaderDialogProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const [typed, setTyped] = useState('')
  const isMatch = typed.trim() === groupName

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) {
          setTyped('')
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('members.transferTitle')}</DialogTitle>
          <DialogDescription>
            {t('members.transferDescription', { name: target?.fullName ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="transfer-confirm">{t('members.transferType', { group: groupName })}</Label>
          <Input id="transfer-confirm" value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {tCommon('action.cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={!isMatch}
            onClick={() => {
              if (target) onConfirm(target.userId)
              setTyped('')
            }}
          >
            {t('members.transfer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
