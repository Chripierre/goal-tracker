import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../uid'
import { evaluateAchievements } from '../achievements/achievements'
import { migrateState } from './migrate'
import type { DailyAssignment } from '../assignments/generate'
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  defaultAppState,
  type ActivityEvent,
  type ActivityEventType,
  type AppState,
} from './schema'

interface AppStore extends AppState {
  appendEvent: (type: ActivityEventType, refId?: string, label?: string) => void
  completeAssignment: (assignment: DailyAssignment) => void
  uncompleteAssignment: (assignment: DailyAssignment) => void
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
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      partialize: (s): AppState => ({
        schemaVersion: s.schemaVersion,
        settings: s.settings,
        events: s.events,
        achievements: s.achievements,
      }),
      migrate: (persisted, version) => migrateState(persisted, version),
    },
  ),
)
