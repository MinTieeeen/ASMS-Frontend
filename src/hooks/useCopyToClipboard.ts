/**
 * @file Copies a text to the clipboard and confirms with a toast.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-16
 * @modified 2026-10-16
 */

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function useCopyToClipboard() {
  const { t } = useTranslation()
  return (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(t('action.copied')))
      .catch(() => toast.error(t('error.generic')))
  }
}
