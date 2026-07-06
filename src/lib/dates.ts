/** Local-timezone day key, e.g. "2026-07-06". All streak math uses these. */
export function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d: Date, n: number): Date {
  const res = new Date(d)
  res.setDate(res.getDate() + n)
  return res
}

export function startOfDay(d: Date): Date {
  const res = new Date(d)
  res.setHours(0, 0, 0, 0)
  return res
}

/** Monday-based week start. */
export function startOfWeek(d: Date): Date {
  const res = startOfDay(d)
  const offset = (res.getDay() + 6) % 7
  res.setDate(res.getDate() - offset)
  return res
}

export function startOfMonth(d: Date): Date {
  const res = startOfDay(d)
  res.setDate(1)
  return res
}
