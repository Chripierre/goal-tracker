import { addDays, localDayKey } from '../dates'
import type { Todo } from '../storage/schema'

/**
 * Zero-setup Google Calendar path: a prefilled all-day event template.
 * Notifications then come from the owner's default Calendar reminder settings.
 * (Full Calendar API sync is a Phase 11 reminder channel.)
 */
export function googleCalendarUrl(todo: Todo): string | null {
  if (!todo.dueDay) return null
  const start = todo.dueDay.replaceAll('-', '')
  const end = localDayKey(addDays(new Date(`${todo.dueDay}T00:00:00`), 1)).replaceAll('-', '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: todo.title,
    dates: `${start}/${end}`,
    details: todo.notes ? `${todo.notes}\n\nFrom Goal Tracker` : 'From Goal Tracker',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
