import { useMemo } from 'react'
import { Link } from 'react-router'
import { Activity, Flame, type LucideIcon } from 'lucide-react'
import { NAV_ITEMS } from '@/app/nav'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { startOfDay, startOfMonth, startOfWeek } from '@/lib/dates'
import { useAppStore } from '@/lib/storage/store'
import { activeDaysFrom, currentStreak } from '@/lib/streak/streak'

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

export function DashboardPage() {
  const events = useAppStore((s) => s.events)
  const displayName = useAppStore((s) => s.settings.displayName)

  const stats = useMemo(() => {
    const now = new Date()
    const countSince = (from: Date) => events.filter((e) => e.ts >= from.getTime()).length
    return {
      streak: currentStreak(activeDaysFrom(events.map((e) => e.ts)), now),
      today: countSince(startOfDay(now)),
      week: countSince(startOfWeek(now)),
      month: countSince(startOfMonth(now)),
    }
  }, [events])

  const now = new Date()
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
          hint={stats.streak === 0 ? 'Complete an assignment to start one' : 'days in a row'}
          icon={Flame}
          iconClass="text-streak"
        />
        <StatCard label="Today" value={String(stats.today)} hint="completions logged" icon={Activity} />
        <StatCard label="This week" value={String(stats.week)} hint="completions since Monday" icon={Activity} />
        <StatCard label="This month" value={String(stats.month)} hint="completions this month" icon={Activity} />
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
