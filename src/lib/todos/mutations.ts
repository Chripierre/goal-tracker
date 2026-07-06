import { localDayKey } from '../dates'
import { uid } from '../uid'
import { nextDueDay } from './recurrence'
import type { Todo } from '../storage/schema'

/**
 * Completing a recurring todo spawns its next occurrence right after it,
 * anchored to max(dueDay, today) so a late completion doesn't spawn another
 * already-overdue instance.
 */
export function completeTodoIn(todos: readonly Todo[], id: string, now: Date): Todo[] {
  const todo = todos.find((t) => t.id === id)
  if (!todo || todo.completedAt) return [...todos]
  return todos.flatMap((t) => {
    if (t.id !== id) return [t]
    const completed: Todo = { ...t, completedAt: now.getTime() }
    if (!t.recurrence || !t.dueDay) return [completed]
    const todayKey = localDayKey(now)
    const anchor = t.dueDay > todayKey ? t.dueDay : todayKey
    const spawn: Todo = {
      ...t,
      id: uid(),
      dueDay: nextDueDay(anchor, t.recurrence),
      spawnedFrom: t.id,
      createdAt: now.getTime(),
    }
    return [completed, spawn]
  })
}

/**
 * Reopens the todo; a successor it spawned is removed only while still open
 * (a completed successor is history and stays).
 */
export function uncompleteTodoIn(todos: readonly Todo[], id: string): Todo[] {
  return todos
    .filter((t) => !(t.spawnedFrom === id && !t.completedAt))
    .map((t) => (t.id === id ? { ...t, completedAt: undefined } : t))
}
