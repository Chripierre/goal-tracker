import { useEffect, useState } from 'react'
import { Award, CalendarCheck, Flame, ListChecks, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import {
  activeDayPct,
  challengeSummary,
  perfectDayCount,
  productiveDayCounts,
} from '@/lib/analytics/analytics'
import { assignmentDays } from '@/lib/assignments/stats'
import { addDays, localDayKey, startOfWeek } from '@/lib/dates'
import { effectiveAssignmentCompletions } from '@/lib/events/completion'
import { fetchEvents } from '@/lib/github/client'
import { LEVEL_CLASSES, levelFor } from '@/lib/github/heatmap'
import { useGithubToken } from '@/lib/github/token'
import { weeklyCounts } from '@/lib/leetcode/stats'
import { useAppStore } from '@/lib/storage/store'
import { currentStreak, longestStreak } from '@/lib/streak/streak'

const HEATMAP_WEEKS = 17

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass = 'text-text-3',
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  iconClass?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-2">{label}</span>
        <Icon className={`size-4 ${iconClass}`} aria-hidden />
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-text-3">{hint}</p>
    </Card>
  )
}

function ActivityHeatmap({ counts, now }: { counts: Record<string, number>; now: Date }) {
  const thisWeek = startOfWeek(now)
  const weeks = Array.from({ length: HEATMAP_WEEKS }, (_, i) =>
    addDays(thisWeek, (i - (HEATMAP_WEEKS - 1)) * 7),
  )
  const todayKey = localDayKey(now)
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px]">
        {weeks.map((weekStart) => (
          <div key={weekStart.getTime()} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, d) => {
              const dayKey = localDayKey(addDays(weekStart, d))
              if (dayKey > todayKey) return <div key={dayKey} className="size-2.5" />
              const count = counts[dayKey] ?? 0
              return (
                <div
                  key={dayKey}
                  title={`${count} completion${count === 1 ? '' : 's'} on ${dayKey}`}
                  className={`size-2.5 rounded-[2px] ${LEVEL_CLASSES[levelFor(count)]}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const events = useAppStore((s) => s.events)
  const todos = useAppStore((s) => s.todos)
  const challenges = useAppStore((s) => s.challenges)
  const ghUsername = useAppStore((s) => s.settings.ghUsername)
  const ghToken = useGithubToken((s) => s.token)

  const [commits30, setCommits30] = useState<number | null>(null)
  useEffect(() => {
    if (!ghUsername) return
    let alive = true
    const cutoff = Date.now() - 30 * 86_400_000
    fetchEvents(ghUsername, ghToken || undefined)
      .then((list) => {
        if (!alive) return
        const total = list
          .filter((e) => e.type === 'PushEvent' && Date.parse(e.created_at) >= cutoff)
          .reduce((sum, e) => {
            const p = e.payload
            const n =
              (Array.isArray(p.commits) ? p.commits.length : undefined) ??
              (typeof p.size === 'number' ? p.size : 1)
            return sum + n
          }, 0)
        setCommits30(total)
      })
      .catch(() => alive && setCommits30(null))
    return () => {
      alive = false
    }
  }, [ghUsername, ghToken])

  const now = new Date()
  const counts = productiveDayCounts(events, todos)
  const completions = effectiveAssignmentCompletions(events)
  const streakDays = assignmentDays(events)
  const streak = currentStreak(streakDays, now)
  const best = longestStreak(streakDays)
  const chall = challengeSummary(challenges)
  const todosDone = todos.filter((t) => t.completedAt).length
  const weekly = weeklyCounts(counts, now, 8)
  const maxWeek = Math.max(...weekly, 1)
  const pct30 = activeDayPct(counts, now)
  const perfect = perfectDayCount(events)
  const activeDaysTotal = Object.values(counts).filter((c) => c > 0).length

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Everything here derives live from your activity history."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assignments"
          value={String(completions.length)}
          hint={`${perfect} perfect day${perfect === 1 ? '' : 's'}`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Best streak"
          value={String(best)}
          hint={`current: ${streak} day${streak === 1 ? '' : 's'}`}
          icon={Flame}
          iconClass="text-streak"
        />
        <StatCard
          label="Challenges"
          value={String(chall.completed)}
          hint={
            chall.completed > 0
              ? `avg score ${chall.avgScore}% · avg milestones ${chall.avgMilestones}%`
              : 'none archived yet'
          }
          icon={Award}
          iconClass="text-warning"
        />
        <StatCard
          label="Todos done"
          value={String(todosDone)}
          hint="personal list, all time"
          icon={ListChecks}
        />
      </div>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-2">Activity heatmap</h2>
          <span className="text-xs text-text-3">
            {activeDaysTotal} active day{activeDaysTotal === 1 ? '' : 's'} · last{' '}
            {HEATMAP_WEEKS} weeks shown
          </span>
        </div>
        <div className="mt-4">
          <ActivityHeatmap counts={counts} now={now} />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-2">Weekly completions</h2>
          <div className="mt-4 flex h-24 items-end gap-2">
            {weekly.map((count, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-20 w-full items-end">
                  <div
                    title={`${count} completions`}
                    className={`w-full rounded-t ${count > 0 ? 'bg-accent/70' : 'bg-surface-2'}`}
                    style={{ height: `${Math.max((count / maxWeek) * 100, count > 0 ? 8 : 4)}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-3">
                  {i === weekly.length - 1 ? 'now' : `-${weekly.length - 1 - i}w`}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-2">Consistency</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-mono text-lg font-semibold tabular-nums">{pct30}%</span>{' '}
              <span className="text-text-3">of the last 30 days had activity</span>
            </p>
            <p>
              <span className="font-mono text-lg font-semibold tabular-nums">{perfect}</span>{' '}
              <span className="text-text-3">perfect assignment days</span>
            </p>
            <p>
              <span className="font-mono text-lg font-semibold tabular-nums">
                {commits30 === null ? '—' : commits30}
              </span>{' '}
              <span className="text-text-3">
                GitHub commits in 30 days{ghUsername ? ' (public events)' : ' — set a username in Settings'}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
