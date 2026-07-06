import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { GitBranch, GitFork, Star, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatRelative } from '@/lib/dates'
import {
  GithubError,
  fetchContributions,
  fetchEvents,
  fetchRepos,
  fetchUser,
  type ContributionCalendar,
  type GhRepo,
  type GhUser,
} from '@/lib/github/client'
import { useGithubToken } from '@/lib/github/token'
import { toFeed, type GhFeedItem } from '@/lib/github/parse'
import { useAppStore } from '@/lib/storage/store'
import { ContributionHeatmap } from './ContributionHeatmap'
import { EventList } from './EventList'

function errorText(e: unknown): string {
  if (e instanceof GithubError && e.status === 403)
    return 'GitHub API rate limit hit — add a token in Settings to raise it, or try again later.'
  if (e instanceof GithubError && e.status === 404) return 'User not found — check the username in Settings.'
  return e instanceof Error ? e.message : 'Something went wrong talking to GitHub.'
}

function CardError({ error }: { error: unknown }) {
  return <p className="px-4 pb-5 pt-2 text-sm text-danger/90">{errorText(error)}</p>
}

export function GithubPage() {
  const username = useAppStore((s) => s.settings.ghUsername)
  const token = useGithubToken((s) => s.token)

  if (!username) {
    return (
      <>
        <PageHeader title="GitHub" description="Activity, repositories, and contributions." />
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="font-medium">No GitHub username configured</p>
          <p className="max-w-md text-sm text-text-2">
            Set your username (and optionally a token for the live heatmap and higher
            API limits) in Settings.
          </p>
          <Link
            to="/settings"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            Open Settings
          </Link>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title="GitHub" description={`Live view of @${username}`} />
      <GithubData key={`${username}:${token}`} username={username} token={token || undefined} />
    </>
  )
}

function GithubData({ username, token }: { username: string; token?: string }) {
  const [user, setUser] = useState<GhUser | null>(null)
  const [userError, setUserError] = useState<unknown>(null)
  const [feed, setFeed] = useState<GhFeedItem[] | null>(null)
  const [feedError, setFeedError] = useState<unknown>(null)
  const [repos, setRepos] = useState<GhRepo[] | null>(null)
  const [reposError, setReposError] = useState<unknown>(null)
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null)
  const [calendarError, setCalendarError] = useState<unknown>(null)

  useEffect(() => {
    let alive = true
    const auth = token
    fetchUser(username, auth)
      .then((d) => alive && setUser(d))
      .catch((e: unknown) => alive && setUserError(e))
    fetchEvents(username, auth)
      .then((d) => alive && setFeed(toFeed(d)))
      .catch((e: unknown) => alive && setFeedError(e))
    fetchRepos(username, auth)
      .then((d) => alive && setRepos(d))
      .catch((e: unknown) => alive && setReposError(e))
    if (token) {
      fetchContributions(username, token)
        .then((d) => alive && setCalendar(d))
        .catch((e: unknown) => alive && setCalendarError(e))
    }
    return () => {
      alive = false
    }
  }, [username, token])

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          {userError ? (
            <CardError error={userError} />
          ) : !user ? (
            <div className="space-y-3">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={`${user.login} avatar`}
                  className="size-12 rounded-full border border-border-subtle"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name ?? user.login}</p>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    @{user.login}
                  </a>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-text-2">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="size-3.5 text-text-3" aria-hidden />
                  <span className="font-mono tabular-nums">{user.public_repos}</span> repos
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-text-3" aria-hidden />
                  <span className="font-mono tabular-nums">{user.followers}</span> followers
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-text-2">Contributions</h2>
          {token ? (
            calendarError ? (
              <CardError error={calendarError} />
            ) : !calendar ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <ContributionHeatmap calendar={calendar} />
            )
          ) : (
            <div>
              <img
                src={`https://ghchart.rshah.org/${username}`}
                alt={`Contribution chart for ${username}`}
                className="w-full rounded"
                style={{ filter: 'invert(0.82) hue-rotate(180deg) saturate(1.2)' }}
              />
              <p className="mt-2 text-xs text-text-3">
                Static chart. Add a token in Settings for the live heatmap and private
                contributions.
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="px-4 pb-1 pt-4 text-sm font-semibold text-text-2">Recent activity</h2>
          {feedError ? (
            <CardError error={feedError} />
          ) : !feed ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : feed.length === 0 ? (
            <p className="px-4 pb-6 pt-2 text-sm text-text-3">No recent public activity.</p>
          ) : (
            <EventList items={feed} limit={12} />
          )}
        </Card>

        <Card>
          <h2 className="px-4 pb-1 pt-4 text-sm font-semibold text-text-2">Repositories</h2>
          {reposError ? (
            <CardError error={reposError} />
          ) : !repos ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : repos.length === 0 ? (
            <p className="px-4 pb-6 pt-2 text-sm text-text-3">No public repositories.</p>
          ) : (
            <div className="p-2">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md px-2 py-2 outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-accent">{repo.name}</span>
                    <span className="ml-auto flex shrink-0 items-center gap-3 text-xs text-text-3">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="size-2 rounded-full bg-accent/70" aria-hidden />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3" aria-hidden />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <GitFork className="size-3" aria-hidden />
                        {repo.forks_count}
                      </span>
                      <span>{formatRelative(Date.parse(repo.pushed_at))}</span>
                    </span>
                  </div>
                  {repo.description && (
                    <p className="mt-0.5 truncate text-xs text-text-3">{repo.description}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
