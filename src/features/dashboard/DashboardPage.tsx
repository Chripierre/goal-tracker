import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  Activity,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  type LucideIcon,
} from 'lucide-react'
import { NAV_ITEMS } from '@/app/nav'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AssignmentRow } from '@/features/assignments/AssignmentRow'
import { ACHIEVEMENTS_BY_ID } from '@/lib/achievements/achievements'
import { generateAssignments } from '@/lib/assignments/generate'
import { assignmentDays, completionsSinceDay } from '@/lib/assignments/stats'
import { formatRelative, localDayKey, startOfMonth, startOfWeek } from '@/lib/dates'
import { completedAssignmentIds, effectiveAssignmentCompletions } from '@/lib/events/completion'
import { useAppStore } from '@/lib/storage/store'
import { currentStreak } from '@/lib/streak/streak'

function greeting(now: Date): string {
  const h = now.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

interface StatCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  iconClass?: string
}

function StatCard({ label, value, hint, icon: Icon, iconClass = 'text-text-3' }: StatCardProps) {
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

interface FeedItem {
  ts: number
  label: string
  kind: 'completion' | 'unlock'
}

export function DashboardPage() {
  const events = useAppStore((s) => s.events)
  const achievements = useAppStore((s) => s.achievements)
  const displayName = useAppStore((s) => s.settings.displayName)
  const complete = useAppStore((s) => s.completeAssignment)
  const uncomplete = useAppStore((s) => s.uncompleteAssignment)

  const now = new Date()
  const todayKey = localDayKey(new Date())

  const assignments = generateAssignments(todayKey)
  const completedIds = useMemo(() => completedAssignmentIds(events), [events])
  const doneToday = assignments.filter((a) => completedIds.has(a.id)).length

  const stats = useMemo(() => {
    const current = new Date()
    return {
      streak: currentStreak(assignmentDays(events), current),
      today: completionsSinceDay(events, localDayKey(current)).length,
      week: completionsSinceDay(events, localDayKey(startOfWeek(current))).length,
      month: completionsSinceDay(events, localDayKey(startOfMonth(current))).length,
    }
  }, [events])

  const completionItems: FeedItem[] = effectiveAssignmentCompletions(events).map((e) => ({
    ts: e.ts,
    label: e.label ?? 'Assignment completed',
    kind: 'completion' as const,
  }))
  const unlockItems: FeedItem[] = achievements.map((u) => ({
    ts: u.unlockedAt,
    label: `Unlocked: ${ACHIEVEMENTS_BY_ID.get(u.id)?.title ?? u.id}`,
    kind: 'unlock' as const,
  }))
  const feed = [...completionItems, ...unlockItems].sort((a, b) => b.ts - a.ts).slice(0, 8)

  const dateLine = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <PageHeader title={`${greeting(now)}, ${displayName}`} description={dateLine} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current streak"
          value={String(stats.streak)}
          hint={stats.streak === 0 ? 'Complete an assignment to start one' : 'days in a row — keep it alive'}
          icon={Flame}
          iconClass="text-streak"
        />
        <StatCard label="Today" value={String(stats.today)} hint="assignments completed" icon={Activity} />
        <StatCard label="This week" value={String(stats.week)} hint="completed since Monday" icon={Activity} />
        <StatCard label="This month" value={String(stats.month)} hint="completed this month" icon={Activity} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-4 pb-1 pt-4">
            <h2 className="text-sm font-semibold text-text-2">Today's assignments</h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tabular-nums text-text-3">
                {doneToday}/{assignments.length}
              </span>
              <Link
                to="/assignments"
                className="flex items-center gap-0.5 rounded-md text-xs font-medium text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
              >
                View all
                <ChevronRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="p-2">
            {assignments.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                completed={completedIds.has(a.id)}
                onToggle={(next) => (next ? complete(a) : uncomplete(a))}
                compact
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="px-4 pb-1 pt-4 text-sm font-semibold text-text-2">Recent activity</h2>
          {feed.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-3">
              Complete your first assignment to start your history.
            </p>
          ) : (
            <div className="p-2">
              {feed.map((item) => (
                <div key={`${item.kind}-${item.ts}-${item.label}`} className="flex items-center gap-2.5 rounded-md px-2 py-2">
                  {item.kind === 'unlock' ? (
                    <Award className="size-4 shrink-0 text-warning" aria-hidden />
                  ) : (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                  <span className="shrink-0 text-xs text-text-3">{formatRelative(item.ts)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-text-2">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {NAV_ITEMS.filter((item) => item.to !== '/').map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Card className="h-full p-5 transition-colors group-hover:border-border group-hover:bg-surface-2/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-surface-2 text-text-2">
                    <item.icon className="size-4" aria-hidden />
                  </div>
                  <Badge>Phase {item.phase}</Badge>
                </div>
                <p className="mt-4 font-medium">{item.label}</p>
                <p className="mt-1 text-sm text-text-2">{item.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
