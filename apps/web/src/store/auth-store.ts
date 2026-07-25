import type { User } from '@tasork/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

/**
 * Access tokens are kept in memory (persisted only for dev convenience);
 * the refresh token itself lives in an httpOnly cookie set by the API and
 * is never touched by client-side JS — see docs/14_Security.md and
 * docs/20_Authentication.md.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clear: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'tasork-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
