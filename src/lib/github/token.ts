import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * The PAT lives in its own storage key, outside the main app state, so it can
 * never travel with exports or (later) multi-device sync.
 */
interface TokenStore {
  token: string
  setToken: (token: string) => void
}

export const useGithubToken = create<TokenStore>()(
  persist(
    (set) => ({
      token: '',
      setToken: (token) => set({ token }),
    }),
    {
      name: 'gt_gh_token',
      version: 1,
      partialize: (s) => ({ token: s.token }) as TokenStore,
    },
  ),
)
