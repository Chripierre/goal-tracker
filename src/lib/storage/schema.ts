export const SCHEMA_VERSION = 3
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
  | 'practice_logged'
  | 'challenge_completed'

/**
 * Append-only. Streaks, stats, and achievements derive from these.
 * Undo is a tombstone event (assignment_uncompleted), never a deletion —
 * the latest completed/uncompleted event per refId wins.
 *
 * Personal todos deliberately do NOT write events (owner decision): they are
 * separate from assignments/challenges and must not double-count toward the
 * streak or stats. Their state lives on the Todo entity alone.
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

export type TodoPriority = 'urgent' | 'high' | 'medium' | 'low'
export type TodoCategory = 'personal' | 'coding' | 'study' | 'career' | 'errand' | 'other'
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly'

export interface Todo {
  id: string
  title: string
  notes?: string
  priority: TodoPriority
  category: TodoCategory
  tags: string[]
  /** Local day key YYYY-MM-DD; day-granular like the rest of the app. */
  dueDay?: string
  /** Recurring todos spawn their next occurrence when completed. */
  recurrence?: RecurrenceFreq
  /** Id of the completed occurrence that spawned this one (undo cleanup). */
  spawnedFrom?: string
  createdAt: number
  completedAt?: number
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION
  settings: Settings
  events: ActivityEvent[]
  achievements: Unlock[]
  /** Array order is the manual sort order. */
  todos: Todo[]
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
    todos: [],
  }
}
