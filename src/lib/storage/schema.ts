export const SCHEMA_VERSION = 2
export const STORAGE_KEY = 'gt_v1'

export interface Settings {
  displayName: string
  theme: 'dark' | 'light'
  ghUsername: string
  lcUsername: string
  reminderTime: string
}

export type ActivityEventType =
  | 'assignment_completed'
  | 'assignment_uncompleted'
  | 'todo_completed'
  | 'practice_logged'
  | 'challenge_completed'

/**
 * Append-only. All streaks, stats, and achievements derive from these.
 * Undo is a tombstone event (assignment_uncompleted), never a deletion —
 * the latest completed/uncompleted event per refId wins.
 */
export interface ActivityEvent {
  id: string
  ts: number
  type: ActivityEventType
  refId?: string
  /** Denormalized snapshot so history renders even if templates change. */
  label?: string
}

/** Cache of a derived unlock; permanent once earned. */
export interface Unlock {
  id: string
  unlockedAt: number
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION
  settings: Settings
  events: ActivityEvent[]
  achievements: Unlock[]
}

export function defaultAppState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      displayName: 'Christian',
      theme: 'dark',
      ghUsername: 'Chripierre',
      lcUsername: '',
      reminderTime: '09:00',
    },
    events: [],
    achievements: [],
  }
}
