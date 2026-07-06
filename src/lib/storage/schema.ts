export const SCHEMA_VERSION = 1
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
  | 'todo_completed'
  | 'practice_logged'
  | 'challenge_completed'

/** Append-only. All streaks, stats, and achievements derive from these. */
export interface ActivityEvent {
  id: string
  ts: number
  type: ActivityEventType
  refId?: string
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION
  settings: Settings
  events: ActivityEvent[]
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
  }
}
