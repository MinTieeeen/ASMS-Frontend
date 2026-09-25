/**
 * @file Authenticated user types.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

// Hand-written for now; replace with the generated type (src/api/generated/models) once /auth/me exists.
export type SystemRole = 'user' | 'admin'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  avatarUrl?: string | null
  systemRole: SystemRole
}
