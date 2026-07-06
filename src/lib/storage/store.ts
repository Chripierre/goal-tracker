import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../uid'
import {
  ACHIEVEMENTS_BY_ID,
  evaluateAchievements,
  type AchievementInput,
} from '../achievements/achievements'
import { useToasts } from '../toast'
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
  type CareerApplication,
  type CareerContact,
  type ChallengeRecord,
  type GameResult,
  type Settings,
  type Todo,
  type Unlock,
} from './schema'
import type { LegacyImport } from '../career/legacy'

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
  startChallenge: (record: Omit<ChallengeRecord, 'startedAt' | 'milestonesDone' | 'rubricChecked' | 'status'>) => void
  toggleChallengeItem: (id: string, field: 'milestonesDone' | 'rubricChecked', itemId: string) => void
  setChallengeRepo: (id: string, repoUrl: string) => void
  completeChallenge: (id: string, result: { score: number; completionPct: number; label: string }) => void
  /** One result per day; later submissions for the same day are ignored. */
  recordGameResult: (result: Omit<GameResult, 'completedAt'>) => void
  setCareerCheck: (id: string, done: boolean) => void
  setCareerStatus: (key: string, status: string) => void
  addApplication: (input: Omit<CareerApplication, 'id'>) => void
  updateApplication: (id: string, patch: Partial<Omit<CareerApplication, 'id'>>) => void
  deleteApplication: (id: string) => void
  addContact: (input: Omit<CareerContact, 'id' | 'addedAt'>) => void
  updateContact: (id: string, patch: Partial<Omit<CareerContact, 'id' | 'addedAt'>>) => void
  deleteContact: (id: string) => void
  /** Merges a mapped cp_tracker_v1 import into career state and todos. */
  applyLegacyImport: (mapped: LegacyImport) => void
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

/** Evaluates new unlocks against a prospective state and raises toasts for them. */
function newUnlocksFor(input: AchievementInput, unlocked: readonly Unlock[]): Unlock[] {
  const fresh = evaluateAchievements(input, unlocked, new Date())
  for (const u of fresh) {
    const def = ACHIEVEMENTS_BY_ID.get(u.id)
    useToasts.getState().push(`Achievement unlocked: ${def?.title ?? u.id}`, def?.description)
  }
  return fresh
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...defaultAppState(),
      appendEvent: (type, refId, label) =>
        set((s) => ({ events: [...s.events, mkEvent(type, refId, label)] })),
      completeAssignment: (assignment) => {
        const s = get()
        const events = [
          ...s.events,
          mkEvent('assignment_completed', assignment.id, assignment.title),
        ]
        const fresh = newUnlocksFor(
          { events, todos: s.todos, challenges: s.challenges, gameResults: s.gameResults },
          s.achievements,
        )
        set({
          events,
          ...(fresh.length ? { achievements: [...s.achievements, ...fresh] } : {}),
        })
      },
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
      completeTodo: (id) => {
        const s = get()
        const todos = completeTodoIn(s.todos, id, new Date())
        const fresh = newUnlocksFor(
          { events: s.events, todos, challenges: s.challenges, gameResults: s.gameResults },
          s.achievements,
        )
        set({
          todos,
          ...(fresh.length ? { achievements: [...s.achievements, ...fresh] } : {}),
        })
      },
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
      setCareerCheck: (id, done) =>
        set((s) => ({ career: { ...s.career, checks: { ...s.career.checks, [id]: done } } })),
      setCareerStatus: (key, status) =>
        set((s) => ({
          career: { ...s.career, statuses: { ...s.career.statuses, [key]: status } },
        })),
      addApplication: (input) =>
        set((s) => ({
          career: {
            ...s.career,
            applications: [...s.career.applications, { ...input, id: uid() }],
          },
        })),
      updateApplication: (id, patch) =>
        set((s) => ({
          career: {
            ...s.career,
            applications: s.career.applications.map((a) =>
              a.id === id ? { ...a, ...patch } : a,
            ),
          },
        })),
      deleteApplication: (id) =>
        set((s) => ({
          career: {
            ...s.career,
            applications: s.career.applications.filter((a) => a.id !== id),
          },
        })),
      addContact: (input) =>
        set((s) => ({
          career: {
            ...s.career,
            contacts: [...s.career.contacts, { ...input, id: uid(), addedAt: Date.now() }],
          },
        })),
      updateContact: (id, patch) =>
        set((s) => ({
          career: {
            ...s.career,
            contacts: s.career.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          },
        })),
      deleteContact: (id) =>
        set((s) => ({
          career: {
            ...s.career,
            contacts: s.career.contacts.filter((c) => c.id !== id),
          },
        })),
      applyLegacyImport: (mapped) =>
        set((s) => ({
          career: {
            ...s.career,
            checks: { ...s.career.checks, ...mapped.career.checks },
            statuses: { ...s.career.statuses, ...mapped.career.statuses },
            applications: [...s.career.applications, ...mapped.career.applications],
          },
          todos: [...s.todos, ...mapped.todos],
        })),
      recordGameResult: (result) => {
        const s = get()
        if (s.gameResults.some((r) => r.dayKey === result.dayKey)) return
        const gameResults = [...s.gameResults, { ...result, completedAt: Date.now() }]
        const fresh = newUnlocksFor(
          { events: s.events, todos: s.todos, challenges: s.challenges, gameResults },
          s.achievements,
        )
        set({
          gameResults,
          ...(fresh.length ? { achievements: [...s.achievements, ...fresh] } : {}),
        })
      },
      startChallenge: (record) =>
        set((s) =>
          s.challenges.some((c) => c.id === record.id)
            ? s
            : {
                challenges: [
                  ...s.challenges,
                  {
                    ...record,
                    startedAt: Date.now(),
                    milestonesDone: [],
                    rubricChecked: [],
                    status: 'active' as const,
                  },
                ],
              },
        ),
      toggleChallengeItem: (id, field, itemId) =>
        set((s) => ({
          challenges: s.challenges.map((c) => {
            if (c.id !== id || c.status !== 'active') return c
            const list = c[field]
            return {
              ...c,
              [field]: list.includes(itemId)
                ? list.filter((x) => x !== itemId)
                : [...list, itemId],
            }
          }),
        })),
      setChallengeRepo: (id, repoUrl) =>
        set((s) => ({
          challenges: s.challenges.map((c) => (c.id === id ? { ...c, repoUrl } : c)),
        })),
      completeChallenge: (id, result) => {
        const s = get()
        const target = s.challenges.find((c) => c.id === id)
        if (!target || target.status === 'completed') return
        const challenges = s.challenges.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'completed' as const,
                completedAt: Date.now(),
                score: result.score,
                completionPct: result.completionPct,
              }
            : c,
        )
        const events = [...s.events, mkEvent('challenge_completed', id, result.label)]
        const fresh = newUnlocksFor(
          { events, todos: s.todos, challenges, gameResults: s.gameResults },
          s.achievements,
        )
        set({
          challenges,
          events,
          ...(fresh.length ? { achievements: [...s.achievements, ...fresh] } : {}),
        })
      },
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
        challenges: s.challenges,
        gameResults: s.gameResults,
        career: s.career,
      }),
      migrate: (persisted, version) => migrateState(persisted, version),
    },
  ),
)
