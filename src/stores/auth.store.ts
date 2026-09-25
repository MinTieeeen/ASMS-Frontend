/**
 * @file Global authentication state.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-09-26
 * @modified 2026-09-26
 */

import { create } from 'zustand'

import type { AuthUser } from '@/types/auth'

interface AuthState {
  /** The access token is kept in memory only, NEVER in localStorage (NFR06) */
  accessToken: string | null
  user: AuthUser | null
  setAccessToken: (token: string) => void
  setSession: (token: string, user: AuthUser) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setSession: (accessToken, user) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
}))

export const selectIsAuthenticated = (state: AuthState) => state.accessToken !== null
export const selectIsAdmin = (state: AuthState) => state.user?.systemRole === 'admin'
