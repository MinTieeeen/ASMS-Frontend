/**
 * @file Asks before leaving a form with unsaved changes (MSG-68): in-app navigation and closing or reloading the tab.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'

import { ConfirmDialog } from './ConfirmDialog'

interface UnsavedChangesDialogProps {
  /** true while the form has changes that are not saved yet */
  when: boolean
}

/**
 * Route changes are held by the router blocker and confirmed in the app's dialog; for closing or reloading the tab only
 * the browser's own prompt is allowed.
 */
export function UnsavedChangesDialog({ when }: UnsavedChangesDialogProps) {
  const { t } = useTranslation()
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!when) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [when])

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => !open && blocker.reset?.()}
      title={t('unsaved.title')}
      description={t('unsaved.description')}
      confirmLabel={t('unsaved.leave')}
      cancelLabel={t('unsaved.stay')}
      onConfirm={() => blocker.proceed?.()}
    />
  )
}
