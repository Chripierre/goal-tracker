import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../uid'
import { migrateState } from './migrate'
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  defaultAppState,
  type ActivityEventType,
  type AppState,
} from './schema'

interface AppStore extends AppState {
  appendEvent: (type: ActivityEventType, refId?: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...defaultAppState(),
      appendEvent: (type, refId) =>
        set((s) => ({
          events: [...s.events, { id: uid(), ts: Date.now(), type, ...(refId ? { refId } : {}) }],
        })),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      partialize: (s): AppState => ({
        schemaVersion: s.schemaVersion,
        settings: s.settings,
        events: s.events,
      }),
      migrate: (persisted, version) => migrateState(persisted, version),
    },
  ),
)
