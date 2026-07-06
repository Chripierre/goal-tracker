import type { Todo, TodoCategory, TodoPriority } from '../storage/schema'

export type TodoStatusFilter = 'open' | 'done' | 'all'
export type TodoSortMode = 'manual' | 'priority' | 'due' | 'created'

export interface TodoFilters {
  query: string
  status: TodoStatusFilter
  priority: TodoPriority | 'all'
  category: TodoCategory | 'all'
  tag: string | null
}

export const DEFAULT_FILTERS: TodoFilters = {
  query: '',
  status: 'open',
  priority: 'all',
  category: 'all',
  tag: null,
}

export const PRIORITY_RANK: Record<TodoPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function isOverdue(todo: Todo, todayKey: string): boolean {
  return !todo.completedAt && !!todo.dueDay && todo.dueDay < todayKey
}

export function filterTodos(todos: readonly Todo[], f: TodoFilters): Todo[] {
  const q = f.query.trim().toLowerCase()
  return todos.filter((t) => {
    if (f.status === 'open' && t.completedAt) return false
    if (f.status === 'done' && !t.completedAt) return false
    if (f.priority !== 'all' && t.priority !== f.priority) return false
    if (f.category !== 'all' && t.category !== f.category) return false
    if (f.tag && !t.tags.includes(f.tag)) return false
    if (q) {
      const haystack = `${t.title} ${t.notes ?? ''} ${t.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

/** Manual mode preserves array order (the stored manual order). */
export function sortTodos(todos: readonly Todo[], mode: TodoSortMode): Todo[] {
  const list = [...todos]
  if (mode === 'priority') {
    list.sort(
      (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt - b.createdAt,
    )
  } else if (mode === 'due') {
    list.sort((a, b) => {
      if (a.dueDay && b.dueDay && a.dueDay !== b.dueDay) return a.dueDay < b.dueDay ? -1 : 1
      if (a.dueDay && !b.dueDay) return -1
      if (!a.dueDay && b.dueDay) return 1
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    })
  } else if (mode === 'created') {
    list.sort((a, b) => b.createdAt - a.createdAt)
  }
  return list
}

export function allTags(todos: readonly Todo[]): string[] {
  return [...new Set(todos.flatMap((t) => t.tags))].sort()
}
