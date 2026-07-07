import type { Todo } from '../storage/schema'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

interface GoogleIdentity {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: { access_token?: string; error?: string }) => void
      }) => TokenClient
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

let gisLoading: Promise<void> | null = null

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  gisLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Google Identity Services.'))
    document.head.appendChild(script)
  })
  return gisLoading
}

/** Pops the Google consent window and resolves with a one-hour access token. */
export async function requestCalendarToken(clientId: string): Promise<string> {
  await loadGis()
  const google = window.google
  if (!google) throw new Error('Google Identity Services unavailable.')
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (res) => {
        if (res.access_token) resolve(res.access_token)
        else reject(new Error(res.error ?? 'Google authorization was denied.'))
      },
    })
    client.requestAccessToken()
  })
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (h * 60 + m + minutes) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export interface GcalEventBody {
  summary: string
  description: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  reminders: { useDefault: boolean; overrides: { method: 'popup'; minutes: number }[] }
}

/** A 30-minute timed event at the owner's reminder time with a popup alert. */
export function buildEventBody(todo: Todo, reminderTime: string, timeZone: string): GcalEventBody {
  const dueDay = todo.dueDay as string
  return {
    summary: todo.title,
    description: `${todo.notes ? `${todo.notes}\n\n` : ''}From Goal Tracker`,
    start: { dateTime: `${dueDay}T${reminderTime}:00`, timeZone },
    end: { dateTime: `${dueDay}T${addMinutesToTime(reminderTime, 30)}:00`, timeZone },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
  }
}

export interface SyncResult {
  created: Record<string, string>
  updated: number
  failed: number
}

/**
 * Creates or updates a calendar event for every open, dated todo. Events map
 * one-to-one via eventMap so re-syncing updates instead of duplicating.
 */
export async function syncTodosToCalendar(
  token: string,
  todos: readonly Todo[],
  eventMap: Record<string, string>,
  reminderTime: string,
): Promise<SyncResult> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const result: SyncResult = { created: {}, updated: 0, failed: 0 }
  const targets = todos.filter((t) => !t.completedAt && t.dueDay)

  for (const todo of targets) {
    const body = buildEventBody(todo, reminderTime, timeZone)
    const existing = eventMap[todo.id]
    const url = existing ? `${API}/${encodeURIComponent(existing)}` : API
    try {
      const res = await fetch(url, {
        method: existing ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (res.status === 404 && existing) {
        // Event was deleted in Calendar; recreate it.
        const retry = await fetch(API, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!retry.ok) throw new Error(`HTTP ${retry.status}`)
        const created = (await retry.json()) as { id: string }
        result.created[todo.id] = created.id
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (existing) {
        result.updated++
      } else {
        const created = (await res.json()) as { id: string }
        result.created[todo.id] = created.id
      }
    } catch {
      result.failed++
    }
  }
  return result
}
