import { create } from 'zustand'
import { decryptString, encryptString, isCipherEnvelope, type CipherEnvelope } from '../crypto'

/**
 * The PAT lives in its own storage slot, outside the main app state, so it can
 * never travel with exports or sync. With the app lock enabled it is stored
 * AES-GCM-encrypted and only ever decrypted into memory for the session.
 */
const KEY = 'gt_gh_token'

type Stored = { mode: 'plain'; token: string } | { mode: 'enc'; env: CipherEnvelope }

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      mode?: string
      token?: string
      env?: unknown
      state?: { token?: string }
    }
    if (parsed.mode === 'plain' && typeof parsed.token === 'string')
      return { mode: 'plain', token: parsed.token }
    if (parsed.mode === 'enc' && isCipherEnvelope(parsed.env))
      return { mode: 'enc', env: parsed.env }
    // pre-lock format (zustand persist envelope) — migrate transparently
    if (typeof parsed.state?.token === 'string' && parsed.state.token)
      return { mode: 'plain', token: parsed.state.token }
    return null
  } catch {
    return null
  }
}

function writeStored(s: Stored | null): void {
  if (s === null) localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, JSON.stringify(s))
}

interface TokenStore {
  /** Usable token for API calls; empty while locked or absent. */
  token: string
  /** An encrypted token exists but has not been unlocked this session. */
  locked: boolean
  hasPassphrase: boolean
  setToken: (token: string) => void
  enableLock: (passphrase: string) => Promise<void>
  unlock: (passphrase: string) => Promise<void>
  removeLock: (passphrase: string) => Promise<void>
  clearToken: () => void
}

export const useGithubToken = create<TokenStore>()((set, get) => ({
  token: '',
  locked: false,
  hasPassphrase: false,
  setToken: (token) => {
    writeStored(token ? { mode: 'plain', token } : null)
    set({ token, locked: false, hasPassphrase: false })
  },
  enableLock: async (passphrase) => {
    const token = get().token
    if (!token || !passphrase) return
    const env = await encryptString(token, passphrase)
    writeStored({ mode: 'enc', env })
    set({ hasPassphrase: true, locked: false })
  },
  unlock: async (passphrase) => {
    const stored = readStored()
    if (stored?.mode !== 'enc') return
    const token = await decryptString(stored.env, passphrase) // throws on wrong passphrase
    set({ token, locked: false, hasPassphrase: true })
  },
  removeLock: async (passphrase) => {
    const stored = readStored()
    if (stored?.mode !== 'enc') return
    const token = await decryptString(stored.env, passphrase)
    writeStored({ mode: 'plain', token })
    set({ token, locked: false, hasPassphrase: false })
  },
  clearToken: () => {
    writeStored(null)
    set({ token: '', locked: false, hasPassphrase: false })
  },
}))

const initial = readStored()
if (initial?.mode === 'plain') {
  useGithubToken.setState({ token: initial.token })
} else if (initial?.mode === 'enc') {
  useGithubToken.setState({ locked: true, hasPassphrase: true })
}
