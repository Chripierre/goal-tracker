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
})
