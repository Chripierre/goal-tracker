const API = 'https://api.github.com'
const CACHE_PREFIX = 'gt_ghc:'
const CACHE_TTL_MS = 10 * 60 * 1000

export class GithubError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface GhUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
}

export interface GhRepo {
  id: number
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
}

export interface GhEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  // Payload shapes vary by event type; parse.ts narrows what it needs.
  payload: Record<string, unknown>
}

export interface ContributionDay {
  date: string
  contributionCount: number
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: { contributionDays: ContributionDay[] }[]
}

function headers(token?: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${key}`
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const entry = JSON.parse(raw) as { ts: number; data: T }
      if (Date.now() - entry.ts < CACHE_TTL_MS) return entry.data
    }
  } catch {
    // corrupt cache entries are ignored and refetched
  }
  const data = await fetcher()
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // quota errors just skip caching
  }
  return data
}

async function rest<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers(token) })
  if (!res.ok) {
    let message = `GitHub API error ${res.status}`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new GithubError(res.status, message)
  }
  return res.json() as Promise<T>
}

export function fetchUser(username: string, token?: string): Promise<GhUser> {
  return cached(`user:${username}:${token ? 'a' : 'p'}`, () =>
    rest<GhUser>(`/users/${encodeURIComponent(username)}`, token),
  )
}

/** Validates a token by asking who it belongs to. Never cached. */
export function fetchAuthenticatedUser(token: string): Promise<GhUser> {
  return rest<GhUser>('/user', token)
}

export function fetchEvents(username: string, token?: string): Promise<GhEvent[]> {
  return cached(`events:${username}:${token ? 'a' : 'p'}`, () =>
    rest<GhEvent[]>(`/users/${encodeURIComponent(username)}/events?per_page=30`, token),
  )
}

export function fetchRepos(username: string, token?: string): Promise<GhRepo[]> {
  return cached(`repos:${username}:${token ? 'a' : 'p'}`, () =>
    rest<GhRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=10&type=owner`,
      token,
    ),
  )
}

/** Contribution calendar requires GraphQL, which requires a token. */
export function fetchContributions(
  username: string,
  token: string,
): Promise<ContributionCalendar> {
  return cached(`contrib:${username}`, async () => {
    const res = await fetch(`${API}/graphql`, {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks { contributionDays { date contributionCount } }
              }
            }
          }
        }`,
        variables: { login: username },
      }),
    })
    if (!res.ok) throw new GithubError(res.status, `GitHub GraphQL error ${res.status}`)
    const body = (await res.json()) as {
      errors?: { message: string }[]
      data?: {
        user: { contributionsCollection: { contributionCalendar: ContributionCalendar } } | null
      }
    }
    if (body.errors?.length) throw new GithubError(400, body.errors[0].message)
    const calendar = body.data?.user?.contributionsCollection.contributionCalendar
    if (!calendar) throw new GithubError(404, `No contribution data for ${username}`)
    return calendar
  })
}
