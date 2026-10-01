/**
 * @file Password policy of BR-AUTH-01, evaluated on the client for the live criteria list (FR-AUTH-18).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-29
 * @modified 2026-09-29
 */

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/config/constants'

/** Same codes as the backend's `violations` of AUTH_PASSWORD_POLICY, in the order of the criteria list. */
export const PASSWORD_CRITERIA = [
  'LENGTH',
  'LETTER',
  'DIGIT',
  'CONTAINS_EMAIL',
  'WHITESPACE',
] as const
export type PasswordCriterion = (typeof PASSWORD_CRITERIA)[number]

/** `true` met, `false` not met, `null` cannot be checked here (email unknown on the reset page). */
export type CriteriaResult = Record<PasswordCriterion, boolean | null>

const MIN_EMAIL_NAME_LENGTH = 4
const LETTER = /\p{L}/u
const DIGIT = /\p{Nd}/u

/**
 * @param email full email of the account; `null` when only a masked email is known, so CONTAINS_EMAIL is left to
 *   the server
 */
export function evaluatePassword(password: string, email: string | null): CriteriaResult {
  const length = [...password].length
  return {
    LENGTH: length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH,
    LETTER: LETTER.test(password),
    DIGIT: DIGIT.test(password),
    CONTAINS_EMAIL: email === null ? null : !containsEmailName(password, email),
    WHITESPACE: password.length === 0 || password === password.trim(),
  }
}

export function meetsPolicy(password: string, email: string | null): boolean {
  return Object.values(evaluatePassword(password, email)).every((met) => met !== false)
}

function containsEmailName(password: string, email: string): boolean {
  const name = email.split('@')[0] ?? ''
  return name.length >= MIN_EMAIL_NAME_LENGTH && password.toLowerCase().includes(name.toLowerCase())
}
