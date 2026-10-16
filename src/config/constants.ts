/**
 * @file Client-side business constants. Source of truth is the requirement; the backend always re-validates.
 * @author MinhTien
 * @version 2.1.0
 * @since 2026-09-26
 * @modified 2026-10-16
 */

export const API_PREFIX = '/api/v1'

export const DEFAULT_PAGE_SIZE = 20

/** BR14: max 25 MB per file */
export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024

/** BR04: group code has 6 alphanumeric characters */
export const GROUP_CODE_LENGTH = 6

/** BR14: storage quota of one group */
export const GROUP_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024
/** BR01: at most 2 deputies per group */
export const MAX_DEPUTIES = 2
/** BR02 / UC03: default member limit of a new group, and the system-wide ceiling */
export const DEFAULT_MAX_MEMBERS = 5
export const SYSTEM_MAX_MEMBERS = 10
/** UC12: a peer review round needs at least 3 members */
export const PEER_REVIEW_MIN_MEMBERS = 3
/** BR12 / UC12-4a: scores and comments are published from 2 reviews up */
export const PEER_REVIEW_MIN_REVIEWS = 2
/** UC07-4: the retrospective board stays open for 3 days after a phase is closed */
export const RETRO_OPEN_DAYS = 3
/** BR08: soft-deleted groups and phases can be restored for 30 days */
export const SOFT_DELETE_RETENTION_DAYS = 30
/** Design system "highlight": a deadline in less than 24 hours needs attention now */
export const DUE_SOON_HOURS = 24

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
