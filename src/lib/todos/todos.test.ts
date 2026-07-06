import { describe, expect, it } from 'vitest'
import type { Todo } from '../storage/schema'
import { DEFAULT_FILTERS, filterTodos, isOverdue, sortTodos } from './filter'
import { googleCalendarUrl } from './gcal'
import { completeTodoIn, uncompleteTodoIn } from './mutations'
import { nextDueDay } from './recurrence'

function mkTodo(partial: Partial<Todo> & { id: string }): Todo {
  return {
    title: partial.id,
    priority: 'medium',
    category: 'personal',
    tags: [],
    createdAt: 1,
    ...partial,
  }
}

const now = new Date(2026, 6, 6, 15) // Monday 2026-07-06

describe('nextDueDay', () => {
  it('advances daily and weekly', () => {
    expect(nextDueDay('2026-07-06', 'daily')).toBe('2026-07-07')
    expect(nextDueDay('2026-07-06', 'weekly')).toBe('2026-07-13')
  })

  it('advances monthly with end-of-month clamping', () => {
    expect(nextDueDay('2026-07-15', 'monthly')).toBe('2026-08-15')
    expect(nextDueDay('2026-01-31', 'monthly')).toBe('2026-02-28')
    expect(nextDueDay('2026-03-31', 'monthly')).toBe('2026-04-30')
  })
})

describe('completeTodoIn', () => {
  it('marks a plain todo complete without spawning', () => {
    const todos = [mkTodo({ id: 'a' })]
    const out = completeTodoIn(todos, 'a', now)
    expect(out).toHaveLength(1)
    expect(out[0].completedAt).toBe(now.getTime())
  })

  it('spawns the next occurrence for a recurring todo, right after it', () => {
    const todos = [mkTodo({ id: 'a', dueDay: '2026-07-06', recurrence: 'daily' }), mkTodo({ id: 'b' })]
    const out = completeTodoIn(todos, 'a', now)
    expect(out).toHaveLength(3)
    expect(out[0].completedAt).toBe(now.getTime())
    expect(out[1].spawnedFrom).toBe('a')
    expect(out[1].dueDay).toBe('2026-07-07')
    expect(out[1].completedAt).toBeUndefined()
    expect(out[2].id).toBe('b')
  })

  it('anchors an overdue recurring completion to today', () => {
    const todos = [mkTodo({ id: 'a', dueDay: '2026-07-01', recurrence: 'daily' })]
    const out = completeTodoIn(todos, 'a', now)
    expect(out[1].dueDay).toBe('2026-07-07')
  })

  it('keeps a future-dated recurring anchor on its own cadence', () => {
    const todos = [mkTodo({ id: 'a', dueDay: '2026-07-10', recurrence: 'weekly' })]
    const out = completeTodoIn(todos, 'a', now)
    expect(out[1].dueDay).toBe('2026-07-17')
  })

  it('is a no-op for already-completed or unknown ids', () => {
    const todos = [mkTodo({ id: 'a', completedAt: 5 })]
    expect(completeTodoIn(todos, 'a', now)).toEqual(todos)
    expect(completeTodoIn(todos, 'zzz', now)).toEqual(todos)
  })
})

describe('uncompleteTodoIn', () => {
  it('reopens and removes the still-open spawned successor', () => {
    const completed = mkTodo({ id: 'a', dueDay: '2026-07-06', recurrence: 'daily', completedAt: 9 })
    const spawn = mkTodo({ id: 's', dueDay: '2026-07-07', recurrence: 'daily', spawnedFrom: 'a' })
    const out = uncompleteTodoIn([completed, spawn], 'a')
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe('a')
    expect(out[0].completedAt).toBeUndefined()
  })

  it('keeps a spawned successor that was itself completed', () => {
    const completed = mkTodo({ id: 'a', completedAt: 9 })
    const spawnDone = mkTodo({ id: 's', spawnedFrom: 'a', completedAt: 10 })
    const out = uncompleteTodoIn([completed, spawnDone], 'a')
    expect(out.map((t) => t.id)).toEqual(['a', 's'])
  })
})

describe('filterTodos / sortTodos / isOverdue', () => {
  const todos = [
    mkTodo({ id: 'a', title: 'Buy groceries', tags: ['errands'], priority: 'low', createdAt: 1 }),
    mkTodo({ id: 'b', title: 'Fix resume', category: 'career', priority: 'urgent', dueDay: '2026-07-05', createdAt: 2 }),
    mkTodo({ id: 'c', title: 'Call dentist', notes: 'about braces', priority: 'high', dueDay: '2026-07-08', completedAt: 5, createdAt: 3 }),
  ]

  it('filters by status', () => {
    expect(filterTodos(todos, DEFAULT_FILTERS).map((t) => t.id)).toEqual(['a', 'b'])
    expect(filterTodos(todos, { ...DEFAULT_FILTERS, status: 'done' }).map((t) => t.id)).toEqual(['c'])
    expect(filterTodos(todos, { ...DEFAULT_FILTERS, status: 'all' })).toHaveLength(3)
  })

  it('searches title, notes, and tags case-insensitively', () => {
    const all = { ...DEFAULT_FILTERS, status: 'all' as const }
    expect(filterTodos(todos, { ...all, query: 'GROC' })[0].id).toBe('a')
    expect(filterTodos(todos, { ...all, query: 'braces' })[0].id).toBe('c')
    expect(filterTodos(todos, { ...all, query: 'errand' })[0].id).toBe('a')
  })

  it('filters by priority, category, and tag', () => {
    const all = { ...DEFAULT_FILTERS, status: 'all' as const }
    expect(filterTodos(todos, { ...all, priority: 'urgent' })[0].id).toBe('b')
    expect(filterTodos(todos, { ...all, category: 'career' })[0].id).toBe('b')
    expect(filterTodos(todos, { ...all, tag: 'errands' })[0].id).toBe('a')
  })

  it('sorts by priority, due date (undated last), and created', () => {
    expect(sortTodos(todos, 'priority').map((t) => t.id)).toEqual(['b', 'c', 'a'])
    expect(sortTodos(todos, 'due').map((t) => t.id)).toEqual(['b', 'c', 'a'])
    expect(sortTodos(todos, 'created').map((t) => t.id)).toEqual(['c', 'b', 'a'])
    expect(sortTodos(todos, 'manual').map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('flags overdue only for open, dated, past todos', () => {
    expect(isOverdue(todos[1], '2026-07-06')).toBe(true)
    expect(isOverdue(todos[0], '2026-07-06')).toBe(false)
    expect(isOverdue(todos[2], '2026-07-09')).toBe(false)
  })
})

describe('googleCalendarUrl', () => {
  it('builds an all-day event template link', () => {
    const url = googleCalendarUrl(mkTodo({ id: 'a', title: 'Fix resume', dueDay: '2026-07-08' }))
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('dates=20260708%2F20260709')
    expect(url).toContain('text=Fix+resume')
  })

  it('returns null without a due day', () => {
    expect(googleCalendarUrl(mkTodo({ id: 'a' }))).toBeNull()
  })
})
