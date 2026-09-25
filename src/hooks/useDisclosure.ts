/**
 * @file Open/close state hook.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { useCallback, useState } from 'react'

/** Manages open/close state for Dialog, Sheet, Dropdown... */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return { isOpen, open, close, toggle, setIsOpen } as const
}
