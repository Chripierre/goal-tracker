import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ExternalLink, Flame } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatRelative } from '@/lib/dates'
import { fetchLcStats, type LcSource, type LcStats } from '@/lib/leetcode/client'
import { lcActiveDays, weakestArea, weeklyCounts } from '@/lib/leetcode/stats'
import { useAppStore } from '@/lib/storage/store'
import { currentStreak } from '@/lib/streak/streak'

function DifficultyCard({
  label,
  solved,
  total,
  tone,
}: {
  label: string
  solved: number
  total: number
  tone: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-2">{label}</span>
        <span className={`text-xs font-medium ${tone}`}>
          {total > 0 ? `${((solved / total) * 100).toFixed(1)}%` : '—'}
        </span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
        {solved}
        <span className="text-sm text-text-3"> / {total}</span>
      </p>
      <ProgressBar value={solved} max={total} className="mt-2" />
    </Card>
  )
}

function LcData({ username }: { username: string }) {
  const [data, setData] = useState<{ stats: LcStats; source: LcSource } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetchLcStats(username)
      .then((d) => alive && setData(d))
      .catch((e: unknown) =>
        alive && setError(e instanceof Error ? e.message : 'Could not load LeetCode stats.'),
      )
    return () => {
      alive = false
    }
  }, [username])

  if (error) {
    return (
      <Card className="px-6 py-10 text-center">
        <p className="text-sm text-danger/90">{error}</p>
        <p className="mt-2 text-xs text-text-3">
          The live community API is unreachable and no synced data exists yet. The daily
          sync workflow publishes your stats once your LeetCode username is set in
          .github/workflows/leetcode-data.yml — until then this page stays empty.
        </p>
      </Card>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-3 h-7 w-24" />
          </Card>
        ))}
        <p className="col-span-full text-xs text-text-3">
          First load can take ~30 seconds while the community API wakes up.
        </p>
      </div>
    )
  }

  const { stats, source } = data
  const streak = currentStreak(lcActiveDays(stats.calendar), new Date())
  const weeks = weeklyCounts(stats.calendar, new Date())
  const maxWeek = Math.max(...weeks, 1)
  const weak = weakestArea(stats)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-2">Solved</span>
            <Flame className="size-4 text-streak" aria-hidden />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{stats.totalSolved}</p>
          <p className="mt-1 text-xs text-text-3">
            {streak > 0 ? `${streak}-day submission streak` : 'no active submission streak'}
            {typeof stats.ranking === 'number' && ` · rank ${stats.ranking.toLocaleString()}`}
          </p>
        </Card>
        <DifficultyCard label="Easy" solved={stats.easySolved} total={stats.easyTotal} tone="text-success" />
        <DifficultyCard label="Medium" solved={stats.mediumSolved} total={stats.mediumTotal} tone="text-warning" />
        <DifficultyCard label="Hard" solved={stats.hardSolved} total={stats.hardTotal} tone="text-danger" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-2">Last 8 weeks</h2>
          <div className="mt-4 flex h-24 items-end gap-2">
            {weeks.map((count, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-20 w-full items-end">
                  <div
                    title={`${count} accepted submissions`}
                    className={`w-full rounded-t ${count > 0 ? 'bg-accent/70' : 'bg-surface-2'}`}
                    style={{ height: `${Math.max((count / maxWeek) * 100, count > 0 ? 8 : 4)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-3">
                  {i === weeks.length - 1 ? 'now' : `-${weeks.length - 1 - i}w`}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-2">Focus</h2>
          <p className="mt-3 text-sm text-text-2">{weak.message}</p>
          <a
            href="https://leetcode.com/problemset/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            Open today's problems
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <p className="mt-4 text-xs text-text-3">
            {source === 'synced'
              ? `Synced from the repo data file, updated ${formatRelative(stats.fetchedAt)}.`
              : `Live from the community API (${formatRelative(stats.fetchedAt)}). The daily
                 repo sync takes over once the workflow has your username.`}
          </p>
        </Card>
      </div>
    </>
  )
}

export function LeetCodePage() {
  const username = useAppStore((s) => s.settings.lcUsername)

  if (!username) {
    return (
      <>
        <PageHeader title="LeetCode" description="Solve stats, streak, trends, and focus areas." />
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="font-medium">No LeetCode username configured</p>
          <p className="max-w-md text-sm text-text-2">
            Add your LeetCode username in Settings and your stats appear here.
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
      <PageHeader title="LeetCode" description={`Stats for ${username}`} />
      <LcData key={username} username={username} />
    </>
  )
}
