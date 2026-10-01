/**
 * @file Confirmation dialog for risky actions (design system Dialog, variant "alert").
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { Loader2 } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel: string
  /** The dialog stays open while it runs; close it from the caller once the action succeeded */
  onConfirm: () => void | Promise<void>
  isPending?: boolean
  /** Red confirm button, for actions that cannot be undone (design system Button "destructive") */
  isDestructive?: boolean
}

/**
 * Secondary button left, primary right (design system Dialog). Radix traps the focus and closes on Esc.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isPending = false,
  isDestructive = true,
}: ConfirmDialogProps) {
  const confirm = (event: MouseEvent) => {
    // AlertDialogAction closes by default; the caller decides when the action is done
    event.preventDefault()
    void onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={isDestructive ? 'destructive' : 'default'}
            disabled={isPending}
            aria-busy={isPending}
            onClick={confirm}
          >
            {isPending && <Loader2 className="animate-spin" aria-hidden />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
