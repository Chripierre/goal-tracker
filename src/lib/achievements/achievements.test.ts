import { describe, expect, it } from 'vitest'
import { addDays, localDayKey } from '../dates'
import { generateAssignments } from '../assignments/generate'
import type { ActivityEvent, Unlock } from '../storage/schema'
import { evaluateAchievements, type AchievementInput } from './achievements'

const now = new Date(2026, 6, 6, 15) // Monday 2026-07-06

function completionsForDay(day: Date, count?: number): ActivityEvent[] {
  const assignments = generateAssignments(localDayKey(day))
  return assignments.slice(0, count ?? assignments.length).map((a, i) => ({
    id: `${a.id}-e`,
    ts: day.getTime() + i,
    type: 'assignment_completed' as const,
    refId: a.id,
    label: a.title,
  }))
}

function input(partial: Partial<AchievementInput>): AchievementInput {
  return { events: [], todos: [], challenges: [], gameResults: [], ...partial }
}

function ids(unlocks: Unlock[]): string[] {
  return unlocks.map((u) => u.id).sort()
}

describe('assignment achievements', () => {
  it('unlocks first-assignment once and never re-earns', () => {
    const i = input({ events: completionsForDay(now, 1) })
    const first = evaluateAchievements(i, [], now)
    expect(ids(first)).toEqual(['first-assignment'])
    expect(evaluateAchievements(i, first, now)).toEqual([])
  })

  it('unlocks perfect-day and streak-3 appropriately', () => {
    const perfectToday = input({ events: completionsForDay(now) })
    expect(ids(evaluateAchievements(perfectToday, [], now))).toContain('perfect-day')

    const threeDays = input({
      events: [
        ...completionsForDay(addDays(now, -2), 1),
        ...completionsForDay(addDays(now, -1), 1),
        ...completionsForDay(now, 1),
      ],
    })
    expect(ids(evaluateAchievements(threeDays, [], now))).toContain('streak-3')
  })

  it('unlocks perfect-week only after seven consecutive perfect days', () => {
    const six = input({
      events: Array.from({ length: 6 }, (_, d) => completionsForDay(addDays(now, -d))).flat(),
    })
    expect(ids(evaluateAchievements(six, [], now))).not.toContain('perfect-week')
    const seven = input({
      events: Array.from({ length: 7 }, (_, d) => completionsForDay(addDays(now, -d))).flat(),
    })
    expect(ids(evaluateAchievements(seven, [], now))).toContain('perfect-week')
  })

  it('ignores tombstoned completions', () => {
    const [c] = completionsForDay(now, 1)
    const i = input({
      events: [c, { id: 'u', ts: c.ts + 1, type: 'assignment_uncompleted', refId: c.refId }],
    })
    expect(evaluateAchievements(i, [], now)).toEqual([])
  })
})

describe('todo, challenge, and game achievements', () => {
  it('unlocks first-todo on a completed todo', () => {
    const i = input({
      todos: [
        { id: 't', title: 'x', priority: 'low', category: 'personal', tags: [], createdAt: 1, completedAt: 2 },
      ],
    })
    expect(ids(evaluateAchievements(i, [], now))).toEqual(['first-todo'])
  })

  it('unlocks shipped and flawless-build for a perfect challenge', () => {
    const i = input({
      challenges: [
        { id: 'w', kind: 'week', templateSlug: 's', startedAt: 1, dueDay: 'x', milestonesDone: [], rubricChecked: [], status: 'completed', score: 100, completionPct: 100 },
      ],
    })
    expect(ids(evaluateAchievements(i, [], now))).toEqual(['challenge-perfect', 'first-challenge'])
  })

  it('unlocks Interview Master only on a perfect round', () => {
    const partial = input({
      gameResults: [{ dayKey: '2026-07-06', score: 300, correct: 4, total: 5, completedAt: 1 }],
    })
    expect(ids(evaluateAchievements(partial, [], now))).toEqual(['first-game'])
    const perfect = input({
      gameResults: [{ dayKey: '2026-07-06', score: 700, correct: 5, total: 5, completedAt: 1 }],
    })
    expect(ids(evaluateAchievements(perfect, [], now))).toEqual(['first-game', 'interview-master'])
  })

  it('unlocks game-streak-7 for seven consecutive play days', () => {
    const results = Array.from({ length: 7 }, (_, d) => ({
      dayKey: localDayKey(addDays(now, -d)),
      score: 100,
      correct: 1,
      total: 5,
      completedAt: d,
    }))
    expect(ids(evaluateAchievements(input({ gameResults: results }), [], now))).toContain(
      'game-streak-7',
    )
  })
})
