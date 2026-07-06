import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../uid'
import { evaluateAchievements } from '../achievements/achievements'
import { completeTodoIn, uncompleteTodoIn } from '../todos/mutations'
import { migrateState } from './migrate'
import type { DailyAssignment } from '../assignments/generate'
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  defaultAppState,
  type ActivityEvent,
  type ActivityEventType,
  type AppState,
  type Settings,
  type Todo,
} from './schema'

export type NewTodoInput = Omit<Todo, 'id' | 'createdAt' | 'completedAt' | 'spawnedFrom'>

interface AppStore extends AppState {
  appendEvent: (type: ActivityEventType, refId?: string, label?: string) => void
  completeAssignment: (assignment: DailyAssignment) => void
  uncompleteAssignment: (assignment: DailyAssignment) => void
  addTodo: (input: NewTodoInput) => void
  updateTodo: (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  deleteTodo: (id: string) => void
  completeTodo: (id: string) => void
  uncompleteTodo: (id: string) => void
  moveTodo: (activeId: string, overId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  /** Replaces app state from an exported backup (runs the normal migration). */
  importState: (data: unknown) => void
  resetState: () => void
}

function mkEvent(type: ActivityEventType, refId?: string, label?: string): ActivityEvent {
  return {
    id: uid(),
    ts: Date.now(),
    type,
    ...(refId ? { refId } : {}),
    ...(label ? { label } : {}),
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...defaultAppState(),
      appendEvent: (type, refId, label) =>
        set((s) => ({ events: [...s.events, mkEvent(type, refId, label)] })),
      completeAssignment: (assignment) =>
        set((s) => {
          const events = [
            ...s.events,
            mkEvent('assignment_completed', assignment.id, assignment.title),
          ]
          const newUnlocks = evaluateAchievements(events, s.achievements, new Date())
          return {
            events,
            achievements: newUnlocks.length
              ? [...s.achievements, ...newUnlocks]
              : s.achievements,
          }
        }),
      uncompleteAssignment: (assignment) =>
        set((s) => ({
          events: [
            ...s.events,
            mkEvent('assignment_uncompleted', assignment.id, assignment.title),
          ],
        })),
      addTodo: (input) =>
        set((s) => ({
          todos: [...s.todos, { ...input, id: uid(), createdAt: Date.now() }],
        })),
      updateTodo: (id, patch) =>
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      completeTodo: (id) =>
        set((s) => ({ todos: completeTodoIn(s.todos, id, new Date()) })),
      uncompleteTodo: (id) =>
        set((s) => ({ todos: uncompleteTodoIn(s.todos, id) })),
      moveTodo: (activeId, overId) =>
        set((s) => {
          const from = s.todos.findIndex((t) => t.id === activeId)
          const to = s.todos.findIndex((t) => t.id === overId)
          if (from < 0 || to < 0 || from === to) return s
          const todos = [...s.todos]
          const [moved] = todos.splice(from, 1)
          todos.splice(to, 0, moved)
          return { todos }
        }),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      importState: (data) => {
        const migrated = migrateState(
          data,
          (data as { schemaVersion?: number })?.schemaVersion ?? 0,
        )
        set(migrated)
      },
      resetState: () => set(defaultAppState()),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      partialize: (s): AppState => ({
        schemaVersion: s.schemaVersion,
        settings: s.settings,
        events: s.events,
        achievements: s.achievements,
        todos: s.todos,
      }),
      migrate: (persisted, version) => migrateState(persisted, version),
    },
  ),
)
