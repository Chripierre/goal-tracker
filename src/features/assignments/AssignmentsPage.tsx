import { useMemo } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { generateAssignments } from '@/lib/assignments/generate'
import { completionsByDay } from '@/lib/assignments/stats'
import { addDays, localDayKey } from '@/lib/dates'
import { completedAssignmentIds } from '@/lib/events/completion'
import { useAppStore } from '@/lib/storage/store'
import { AssignmentRow } from './AssignmentRow'

interface HistoryDay {
  dayKey: string
  done: number
  total: number
}

function formatDayKey(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function AssignmentsPage() {
  const events = useAppStore((s) => s.events)
  const complete = useAppStore((s) => s.completeAssignment)
  const uncomplete = useAppStore((s) => s.uncompleteAssignment)

  const todayKey = localDayKey(new Date())
  const assignments = useMemo(() => generateAssignments(todayKey), [todayKey])
  const completedIds = useMemo(() => completedAssignmentIds(events), [events])
  const done = assignments.filter((a) => completedIds.has(a.id)).length

  const history = useMemo<HistoryDay[]>(() => {
    const byDay = completionsByDay(events)
    const earliest = [...byDay.keys()].sort()[0]
    if (!earliest) return []
    const days: HistoryDay[] = []
    for (let offset = 1; offset <= 14; offset++) {
      const dayKey = localDayKey(addDays(new Date(`${todayKey}T00:00:00`), -offset))
      if (dayKey < earliest) break
      days.push({
        dayKey,
        done: byDay.get(dayKey) ?? 0,
        total: generateAssignments(dayKey).length,
      })
    }
    return days
  }, [events, todayKey])

  const dateLine = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <PageHeader title="Assignments" description={dateLine}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-text-2">
            {done}/{assignments.length} today
          </span>
          <ProgressBar value={done} max={assignments.length} className="w-32" />
        </div>
      </PageHeader>

      <Card className="p-2">
        {assignments.map((a) => (
          <AssignmentRow
            key={a.id}
            assignment={a}
            completed={completedIds.has(a.id)}
            onToggle={(next) => (next ? complete(a) : uncomplete(a))}
          />
        ))}
      </Card>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-text-2">History</h2>
        {history.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="text-sm text-text-2">
              History appears here once you complete your first assignment.
            </p>
          </Card>
        ) : (
          <Card className="divide-y divide-border-subtle">
            {history.map((day) => (
              <div key={day.dayKey} className="flex items-center gap-4 px-4 py-3">
                <span
                  className={`w-28 shrink-0 text-sm ${day.done === 0 ? 'text-text-3' : ''}`}
                >
                  {formatDayKey(day.dayKey)}
                </span>
                <ProgressBar value={day.done} max={day.total} className="w-24" />
                <span className="font-mono text-xs tabular-nums text-text-3">
                  {day.done}/{day.total}
                </span>
                {day.done === day.total && (
                  <Badge variant="success" className="ml-auto">
                    Perfect
                  </Badge>
                )}
              </div>
            ))}
          </Card>
        )}
      </section>
    </>
  )
}
