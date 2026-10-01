/**
 * @file Live checklist of the password policy under a new-password field (FR-AUTH-18, BR-AUTH-01).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { Check, Dot, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import {
  evaluatePassword,
  PASSWORD_CRITERIA,
  type PasswordCriterion,
} from '../utils/password-policy'

interface PasswordCriteriaListProps {
  password: string
  /** Full email of the account; `null` when only a masked email is known (reset page) */
  email: string | null
  /** After the first submit, unmet criteria turn red (screen conventions) */
  isSubmitted: boolean
  /** Violations reported by the server (AUTH_PASSWORD_POLICY), always shown red */
  serverViolations?: readonly string[]
  id?: string
  className?: string
}

type CriterionState = 'met' | 'idle' | 'failed'

/**
 * Met: green check; not met yet: grey dot; after submit or when the server rejected it: red cross.
 * Each state also has a visually hidden word, so it is not told by color alone.
 */
export function PasswordCriteriaList({
  password,
  email,
  isSubmitted,
  serverViolations = [],
  id,
  className,
}: PasswordCriteriaListProps) {
  const { t } = useTranslation('auth')
  const result = evaluatePassword(password, email)

  const stateOf = (criterion: PasswordCriterion): CriterionState => {
    if (serverViolations.includes(criterion)) return 'failed'
    const met = result[criterion]
    if (met === true) return 'met'
    return met === false && isSubmitted ? 'failed' : 'idle'
  }

  return (
    <ul
      id={id}
      aria-label={t('criteria.label')}
      className={cn('flex flex-col gap-1.5 rounded-lg bg-background px-3.5 py-3', className)}
    >
      {PASSWORD_CRITERIA.map((criterion) => {
        const state = stateOf(criterion)
        const label =
          criterion === 'CONTAINS_EMAIL' && email === null
            ? t('criteria.CONTAINS_EMAIL_LATER')
            : t(`criteria.${criterion}`)
        return (
          <li
            key={criterion}
            className={cn(
              'flex items-center gap-2 text-[13px] leading-[18px]',
              state === 'met' && 'text-foreground',
              state === 'idle' && 'text-muted-foreground',
              state === 'failed' && 'text-destructive-text',
            )}
          >
            <CriterionIcon state={state} />
            <span>{label}</span>
            <span className="sr-only">
              {state === 'met' ? t('criteria.met') : t('criteria.unmet')}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function CriterionIcon({ state }: { state: CriterionState }) {
  if (state === 'met')
    return <Check className="size-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
  if (state === 'failed') return <X className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
  return <Dot className="size-4 shrink-0 text-input" strokeWidth={6} aria-hidden />
}
