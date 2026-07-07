import {
  SCHEMA_VERSION,
  defaultAppState,
  defaultCareerState,
  defaultGcalState,
  type AppState,
} from './schema'

/**
 * Additive, never destructive: unknown input falls back to defaults, known
 * fields are kept, new fields are filled from defaults. Future schema bumps
 * chain their transforms here keyed off fromVersion.
 */
export function migrateState(persisted: unknown, _fromVersion: number): AppState {
  const base = defaultAppState()
  if (!persisted || typeof persisted !== 'object') return base
  const p = persisted as Partial<AppState>
  return {
    ...base,
    ...p,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...(p.settings ?? {}) },
    events: Array.isArray(p.events) ? p.events : [],
    achievements: Array.isArray(p.achievements) ? p.achievements : [],
    todos: Array.isArray(p.todos) ? p.todos : [],
    challenges: Array.isArray(p.challenges) ? p.challenges : [],
    gameResults: Array.isArray(p.gameResults) ? p.gameResults : [],
    career:
      p.career && typeof p.career === 'object'
        ? { ...defaultCareerState(), ...p.career }
        : defaultCareerState(),
    gcal:
      p.gcal && typeof p.gcal === 'object'
        ? { ...defaultGcalState(), ...p.gcal }
        : defaultGcalState(),
  }
}
