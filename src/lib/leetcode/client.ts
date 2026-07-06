import { localDayKey } from '../dates'

export interface LcStats {
  username: string
  fetchedAt: number
  totalSolved: number
  easySolved: number
  easyTotal: number
  mediumSolved: number
  mediumTotal: number
  hardSolved: number
  hardTotal: number
  ranking?: number
  acceptanceRate?: number
  /** dayKey -> accepted submission count */
  calendar: Record<string, number>
}

export type LcSource = 'synced' | 'proxy'

const CACHE_KEY = 'gt_lc'
const CACHE_TTL_MS = 10 * 60 * 1000
const SYNCED_MAX_AGE_MS = 48 * 60 * 60 * 1000
const PROXY = 'https://leetcode-stats-api.herokuapp.com'

interface ProxyResponse {
  status: string
  message?: string
  totalSolved: number
  easySolved: number
  totalEasy: number
  mediumSolved: number
  totalMedium: number
  hardSolved: number
  totalHard: number
  ranking: number
  acceptanceRate: number
  submissionCalendar: Record<string, number>
}

export function calendarFromEpochSeconds(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [sec, count] of Object.entries(raw)) {
    const day = localDayKey(new Date(Number(sec) * 1000))
    out[day] = (out[day] ?? 0) + count
  }
  return out
}

function mapProxy(username: string, p: ProxyResponse): LcStats {
  return {
    username,
    fetchedAt: Date.now(),
    totalSolved: p.totalSolved,
    easySolved: p.easySolved,
    easyTotal: p.totalEasy,
    mediumSolved: p.mediumSolved,
    mediumTotal: p.totalMedium,
    hardSolved: p.hardSolved,
    hardTotal: p.totalHard,
    ranking: p.ranking,
    acceptanceRate: p.acceptanceRate,
    calendar: calendarFromEpochSeconds(p.submissionCalendar ?? {}),
  }
}

/**
 * Prefers the repo-synced data file (written daily by the leetcode-data
 * workflow), falls back to the community proxy (Heroku cold start can take
 * ~30s). Proxy results cached 10 minutes.
 */
export async function fetchLcStats(
  username: string,
): Promise<{ stats: LcStats; source: LcSource }> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/leetcode.json`, {
      cache: 'no-cache',
    })
    if (res.ok) {
      const data = (await res.json()) as LcStats
      if (
        data.username?.toLowerCase() === username.toLowerCase() &&
        Date.now() - data.fetchedAt < SYNCED_MAX_AGE_MS
      ) {
        return { stats: data, source: 'synced' }
      }
    }
  } catch {
    // no synced file — fall through to the proxy
  }

  const cacheKey = `${CACHE_KEY}:${username.toLowerCase()}`
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const entry = JSON.parse(raw) as { ts: number; stats: LcStats }
      if (Date.now() - entry.ts < CACHE_TTL_MS) return { stats: entry.stats, source: 'proxy' }
    }
  } catch {
    // ignore corrupt cache
  }

  const res = await fetch(`${PROXY}/${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`LeetCode proxy error ${res.status}`)
  const body = (await res.json()) as ProxyResponse
  if (body.status !== 'success') throw new Error(body.message ?? 'LeetCode user not found')
  const stats = mapProxy(username, body)
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), stats }))
  } catch {
    // quota errors just skip caching
  }
  return { stats, source: 'proxy' }
}
