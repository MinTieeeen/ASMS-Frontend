/**
 * @file Global authentication state (section 7.1 `authStore`).
 * @author MinhTien
 * @version 2.1.0
 * @since 2026-09-26
 * @modified 2026-09-29
 */

import { create } from 'zustand'

import type { CurrentUserResponse } from '@/api/generated/models'

/**
 * - `loading`: the session is being restored at startup; routes are not rendered yet (FR-AUTH-08)
 * - `authenticated`: an access token and the user are known
 * - `anonymous`: nobody is signed in
 */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthState {
  status: AuthStatus
  /** Kept in memory only, NEVER in localStorage or sessionStorage (NFR06) */
  accessToken: string | null
  user: CurrentUserResponse | null
  /**
   * Where a protected page sends the user after the session ended on purpose (logout, logout of every device,
   * lockout). `null` means "login page with the current page as redirect".
   */
  exitPath: string | null
  setSession: (accessToken: string, user: CurrentUserResponse) => void
  setAccessToken: (accessToken: string) => void
  setUser: (user: CurrentUserResponse) => void
  /** @param exitPath see {@link AuthState.exitPath} */
  setAnonymous: (exitPath?: string) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  accessToken: null,
  user: null,
  exitPath: null,
  setSession: (accessToken, user) =>
    set({ status: 'authenticated', accessToken, user, exitPath: null }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setAnonymous: (exitPath) =>
    set({ status: 'anonymous', accessToken: null, user: null, exitPath: exitPath ?? null }),
}))

export const selectAuthStatus = (state: AuthState) => state.status
export const selectUser = (state: AuthState) => state.user
export const selectExitPath = (state: AuthState) => state.exitPath
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated'
export const selectIsAdmin = (state: AuthState) => state.user?.systemRole === 'ADMIN'
