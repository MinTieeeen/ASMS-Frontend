/**
 * @file "Join with a code" dialog (UC04 step 2): the 6-character code opens the group preview before joining.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { GROUP_CODE_LENGTH } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const CODE_PATTERN = /^[A-Z0-9]{6}$/

interface JoinCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinCodeDialog({ open, onOpenChange }: JoinCodeDialogProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!CODE_PATTERN.test(code)) {
      setIsInvalid(true)
      return
    }
    onOpenChange(false)
    void navigate(ROUTES.joinGroup(code))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{t('join.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('join.dialogDescription')}</DialogDescription>
          </DialogHeader>
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="join-code">{t('invite.code')}</FieldLabel>
            <Input
              id="join-code"
              value={code}
              autoFocus
              autoComplete="off"
              maxLength={GROUP_CODE_LENGTH}
              placeholder="K7Q2MX"
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? 'join-code-error' : 'join-code-hint'}
              className="h-12 text-center font-mono text-xl tracking-[0.4em] uppercase"
              onChange={(event) => {
                setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                setIsInvalid(false)
              }}
            />
            {isInvalid ? (
              <FieldError id="join-code-error">{t('validation.codeInvalid')}</FieldError>
            ) : (
              <p id="join-code-hint" className="text-xs text-muted-foreground">
                {t('join.tryCodes')}
              </p>
            )}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('action.cancel')}
            </Button>
            <Button type="submit">{t('join.continue')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
