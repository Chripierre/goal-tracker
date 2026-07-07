import { describe, expect, it } from 'vitest'
import type { Todo } from '../storage/schema'
import { addMinutesToTime, buildEventBody } from './gcal'

const todo: Todo = {
  id: 't1',
  title: 'Dentist appointment',
  notes: 'about braces',
  priority: 'medium',
  category: 'personal',
  tags: [],
  dueDay: '2026-07-10',
  createdAt: 1,
}

describe('addMinutesToTime', () => {
  it('adds minutes with padding and hour rollover', () => {
    expect(addMinutesToTime('09:00', 30)).toBe('09:30')
    expect(addMinutesToTime('09:45', 30)).toBe('10:15')
    expect(addMinutesToTime('23:45', 30)).toBe('00:15')
  })
})

describe('buildEventBody', () => {
  it('builds a 30-minute timed event at the reminder time with a popup', () => {
    const body = buildEventBody(todo, '09:00', 'America/New_York')
    expect(body.summary).toBe('Dentist appointment')
    expect(body.description).toContain('about braces')
    expect(body.description).toContain('From Goal Tracker')
    expect(body.start).toEqual({ dateTime: '2026-07-10T09:00:00', timeZone: 'America/New_York' })
    expect(body.end.dateTime).toBe('2026-07-10T09:30:00')
    expect(body.reminders.overrides).toEqual([{ method: 'popup', minutes: 0 }])
  })
})
