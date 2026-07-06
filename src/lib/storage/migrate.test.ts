import { describe, expect, it } from 'vitest'
import { migrateState } from './migrate'
import { SCHEMA_VERSION, defaultAppState } from './schema'

describe('migrateState', () => {
  it('returns defaults for null, undefined, and garbage', () => {
    expect(migrateState(null, 0)).toEqual(defaultAppState())
    expect(migrateState(undefined, 0)).toEqual(defaultAppState())
    expect(migrateState('nonsense', 0)).toEqual(defaultAppState())
  })

  it('fills missing settings from defaults without dropping stored ones', () => {
    const out = migrateState({ settings: { lcUsername: 'chris' } }, 1)
    expect(out.settings.lcUsername).toBe('chris')
    expect(out.settings.theme).toBe('dark')
    expect(out.settings.reminderTime).toBe('09:00')
  })

  it('preserves events and stamps the current schema version', () => {
    const events = [{ id: 'a', ts: 1, type: 'todo_completed' as const }]
    const out = migrateState({ schemaVersion: 0, events }, 0)
    expect(out.events).toEqual(events)
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('drops non-array events', () => {
    expect(migrateState({ events: 'corrupt' }, 1).events).toEqual([])
  })

  it('migrates v1 state (no achievements field) to v2 with an empty cache', () => {
    const v1 = { schemaVersion: 1, settings: { lcUsername: 'chris' }, events: [] }
    const out = migrateState(v1, 1)
    expect(out.achievements).toEqual([])
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('preserves existing achievement unlocks', () => {
    const unlocks = [{ id: 'first-assignment', unlockedAt: 5 }]
    expect(migrateState({ achievements: unlocks }, 2).achievements).toEqual(unlocks)
  })

  it('migrates v2 state (no todos field) to v3 with an empty list', () => {
    const out = migrateState({ schemaVersion: 2, events: [], achievements: [] }, 2)
    expect(out.todos).toEqual([])
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('preserves existing todos', () => {
    const todos = [{ id: 't1', title: 'x', priority: 'low', category: 'personal', tags: [], createdAt: 1 }]
    expect(migrateState({ todos }, 3).todos).toEqual(todos)
  })

  it('migrates v3 state (no challenges field) to v4 with an empty list', () => {
    const out = migrateState({ schemaVersion: 3, todos: [] }, 3)
    expect(out.challenges).toEqual([])
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('migrates v4 state (no gameResults field) to v5 with an empty list', () => {
    const out = migrateState({ schemaVersion: 4, challenges: [] }, 4)
    expect(out.gameResults).toEqual([])
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('migrates v5 state (no career field) to v6 with defaults, preserving partials', () => {
    expect(migrateState({ schemaVersion: 5 }, 5).career).toEqual({
      checks: {},
      statuses: {},
      applications: [],
      contacts: [],
    })
    const partial = migrateState({ career: { checks: { t01: true } } }, 6)
    expect(partial.career.checks).toEqual({ t01: true })
    expect(partial.career.contacts).toEqual([])
  })
})
