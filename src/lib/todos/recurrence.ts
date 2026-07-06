import { addDays, localDayKey } from '../dates'
import type { RecurrenceFreq } from '../storage/schema'

/** Next due day after fromDay; monthly clamps to the target month's length. */
export function nextDueDay(fromDay: string, freq: RecurrenceFreq): string {
  const d = new Date(`${fromDay}T00:00:00`)
  if (freq === 'daily') return localDayKey(addDays(d, 1))
  if (freq === 'weekly') return localDayKey(addDays(d, 7))
  const target = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(d.getDate(), lastDay))
  return localDayKey(target)
}
