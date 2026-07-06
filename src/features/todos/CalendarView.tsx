import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { addDays, localDayKey, startOfMonth, startOfWeek } from '@/lib/dates'
import { isOverdue } from '@/lib/todos/filter'
import type { Todo } from '@/lib/storage/schema'
import { TodoRow } from './TodoRow'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_CHIPS = 3

interface CalendarViewProps {
  todos: readonly Todo[]
  month: Date
  todayKey: string
  selectedDay: string | null
  onMonthChange: (next: Date) => void
  onSelectDay: (dayKey: string) => void
  onToggle: (id: string, next: boolean) => void
  onAddForDay: (dayKey: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

function navButtonClass(): string {
  return 'rounded-md p-1.5 text-text-2 outline-none transition-colors hover:bg-surface-2 hover:text-text focus-visible:ring-2 focus-visible:ring-accent'
}

export function CalendarView({
  todos,
  month,
  todayKey,
  selectedDay,
  onMonthChange,
  onSelectDay,
  onToggle,
  onAddForDay,
  onEdit,
  onDelete,
}: CalendarViewProps) {
  const monthStart = startOfMonth(month)
  const gridStart = startOfWeek(monthStart)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const monthIdx = monthStart.getMonth()

  const byDay = new Map<string, Todo[]>()
  for (const t of todos) {
    if (!t.dueDay) continue
    const list = byDay.get(t.dueDay) ?? []
    list.push(t)
    byDay.set(t.dueDay, list)
  }

  const selectedTodos = selectedDay ? (byDay.get(selectedDay) ?? []) : []
  const monthLabel = monthStart.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(monthStart.getFullYear(), monthIdx - 1, 1))}
          aria-label="Previous month"
          className={navButtonClass()}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onMonthChange(new Date())}
          className="rounded-md px-2.5 py-1 text-sm text-text-2 outline-none transition-colors hover:bg-surface-2 hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(monthStart.getFullYear(), monthIdx + 1, 1))}
          aria-label="Next month"
          className={navButtonClass()}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle">
        <div className="grid grid-cols-7 gap-px border-b border-border-subtle bg-surface">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-1.5 text-center text-xs font-medium text-text-3">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border-subtle">
          {cells.map((cell) => {
            const dayKey = localDayKey(cell)
            const inMonth = cell.getMonth() === monthIdx
            const isToday = dayKey === todayKey
            const isSelected = dayKey === selectedDay
            const dayTodos = byDay.get(dayKey) ?? []
            return (
              <div
                key={dayKey}
                className={`group/cell relative min-h-24 p-1.5 ${
                  isSelected ? 'bg-surface-2/70' : inMonth ? 'bg-surface' : 'bg-surface/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectDay(dayKey)}
                    aria-label={`Select ${dayKey}`}
                    className={`flex size-6 items-center justify-center rounded-full text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                      isToday
                        ? 'bg-accent font-semibold text-white'
                        : inMonth
                          ? 'text-text-2 hover:bg-surface-2'
                          : 'text-text-3 hover:bg-surface-2'
                    }`}
                  >
                    {cell.getDate()}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddForDay(dayKey)}
                    aria-label={`Add todo on ${dayKey}`}
                    className="rounded p-0.5 text-text-3 opacity-0 outline-none transition-opacity hover:text-text focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover/cell:opacity-100"
                  >
                    <Plus className="size-3.5" aria-hidden />
                  </button>
                </div>
                <div className="mt-1 space-y-0.5">
                  {dayTodos.slice(0, MAX_CHIPS).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onToggle(t.id, !t.completedAt)}
                      title={`${t.title} — click to ${t.completedAt ? 'reopen' : 'complete'}`}
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                        t.completedAt
                          ? 'bg-surface-2 text-text-3 line-through'
                          : isOverdue(t, todayKey)
                            ? 'bg-danger/15 text-danger hover:bg-danger/25'
                            : 'bg-accent/15 text-accent hover:bg-accent/25'
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                  {dayTodos.length > MAX_CHIPS && (
                    <button
                      type="button"
                      onClick={() => onSelectDay(dayKey)}
                      className="block w-full rounded px-1.5 text-left text-[11px] text-text-3 outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      +{dayTodos.length - MAX_CHIPS} more
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <Card className="mt-4">
          <div className="flex items-center justify-between px-4 pb-1 pt-4">
            <h3 className="text-sm font-semibold text-text-2">
              {new Date(`${selectedDay}T00:00:00`).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <button
              type="button"
              onClick={() => onAddForDay(selectedDay)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent outline-none transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus className="size-3.5" aria-hidden />
              Add todo
            </button>
          </div>
          {selectedTodos.length === 0 ? (
            <p className="px-4 pb-6 pt-2 text-sm text-text-3">Nothing due this day.</p>
          ) : (
            <div className="p-2">
              {selectedTodos.map((t) => (
                <TodoRow
                  key={t.id}
                  todo={t}
                  todayKey={todayKey}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
