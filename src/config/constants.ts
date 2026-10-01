/**
 * @file Client-side business constants. Source of truth is the requirement; the backend always re-validates.
 * @author MinhTien
 * @version 2.0.0
 * @since 2026-09-26
 * @modified 2026-09-27
 */

export const API_PREFIX = '/api/v1'

export const DEFAULT_PAGE_SIZE = 20

/** BR14: max 25 MB per file */
export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024

/** BR04: group code has 6 alphanumeric characters */
export const GROUP_CODE_LENGTH = 6

/** BR-AUTH-01: password length 8 to 64 characters */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 64
/** Login accepts any stored password up to this length (SCR-AUTH-01, component 5) */
export const LOGIN_PASSWORD_MAX_LENGTH = 128

/** BR-AUTH-02 */
export const EMAIL_MAX_LENGTH = 255
// User ID, the sign-in identifier: MSSV of a student, a code such as "admin" for an Admin
export const USER_CODE_MAX_LENGTH = 20

/** SCR-AUTH-02: "Resend" stays disabled for 60 seconds */
export const FORGOT_RESEND_COOLDOWN_SECONDS = 60

/** Section 7.3: after AUTH_REFRESH_RACE wait 300 ms, then retry once */
export const REFRESH_RACE_RETRY_MS = 300
/** SCR-AUTH-08: requests waiting for a refresh are cancelled after 10 seconds */
export const REFRESH_QUEUE_TIMEOUT_MS = 10_000
/** SCR-AUTH-07 A2: logout does not wait longer than 3 seconds for the API */
export const LOGOUT_TIMEOUT_MS = 3_000
/** SCR-AUTH-08: show the loader only after 300 ms, the slow-connection text after 5 s */
export const BOOT_LOADER_DELAY_MS = 300
export const BOOT_SLOW_AFTER_MS = 5_000

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi'
