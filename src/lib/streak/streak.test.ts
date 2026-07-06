import { describe, expect, it } from 'vitest'
import { addDays, localDayKey, startOfMonth, startOfWeek } from '../dates'
import { activeDaysFrom, currentStreak } from './streak'

const monday = new Date(2026, 6, 6, 15, 30) // 2026-07-06 is a Monday

function daySet(...dates: Date[]): Set<string> {
  return new Set(dates.map(localDayKey))
}

describe('currentStreak', () => {
  it('is 0 with no activity', () => {
    expect(currentStreak(new Set(), monday)).toBe(0)
  })

  it('counts today', () => {
    expect(currentStreak(daySet(monday), monday)).toBe(1)
  })

  it('survives on yesterday grace (streak not yet broken today)', () => {
    expect(currentStreak(daySet(addDays(monday, -1)), monday)).toBe(1)
  })

  it('counts consecutive days', () => {
    const days = daySet(monday, addDays(monday, -1), addDays(monday, -2))
    expect(currentStreak(days, monday)).toBe(3)
  })

  it('breaks on a gap', () => {
    const days = daySet(monday, addDays(monday, -2), addDays(monday, -3))
    expect(currentStreak(days, monday)).toBe(1)
  })

  it('is 0 when last activity was two days ago', () => {
    expect(currentStreak(daySet(addDays(monday, -2)), monday)).toBe(0)
  })
})

describe('date helpers', () => {
  it('localDayKey formats with padding', () => {
    expect(localDayKey(new Date(2026, 0, 3))).toBe('2026-01-03')
  })

  it('startOfWeek is Monday-based', () => {
    const sunday = new Date(2026, 6, 12, 9, 0)
    expect(localDayKey(startOfWeek(sunday))).toBe('2026-07-06')
    expect(localDayKey(startOfWeek(monday))).toBe('2026-07-06')
  })

  it('startOfMonth clamps to the 1st', () => {
    expect(localDayKey(startOfMonth(monday))).toBe('2026-07-01')
  })

  it('activeDaysFrom dedupes same-day timestamps', () => {
    const noon = new Date(2026, 6, 6, 12).getTime()
    const evening = new Date(2026, 6, 6, 20).getTime()
    expect(activeDaysFrom([noon, evening]).size).toBe(1)
  })
})
