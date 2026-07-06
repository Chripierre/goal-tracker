import { uid } from '../uid'
import type { CareerApplication, CareerState, Todo, TodoPriority } from '../storage/schema'

interface LegacyCustomTask {
  id?: string
  text?: string
  priority?: string
  meta?: string
  done?: boolean
}

interface LegacyApp {
  id?: string
  company?: string
  role?: string
  date?: string
  status?: string
  notes?: string
}

interface LegacyState {
  checks?: Record<string, boolean>
  custom?: LegacyCustomTask[]
  apps?: LegacyApp[]
  certStatus?: Record<string, string>
  projStatus?: Record<string, string>
  scholStatus?: Record<string, string>
  internStatus?: Record<string, string>
  jobStatus?: Record<string, string>
}

export interface LegacyImport {
  career: Pick<CareerState, 'checks' | 'statuses' | 'applications'>
  todos: Todo[]
  summary: string
}

const PRIORITY_MAP: Record<string, TodoPriority> = {
  urgent: 'urgent',
  high: 'high',
  ongoing: 'low',
}

function statusEntries(prefix: string, map: Record<string, string> | undefined): [string, string][] {
  return Object.entries(map ?? {}).map(([id, status]) => [`${prefix}:${id}`, status])
}

/**
 * Maps the legacy cp_tracker_v1 state into this app's shapes. netStatus is
 * intentionally dropped: the prospect list was removed from the public repo,
 * so there is nothing for those statuses to attach to.
 */
export function mapLegacyState(data: unknown): LegacyImport | null {
  if (!data || typeof data !== 'object') return null
  const legacy = data as LegacyState
  const looksLegacy =
    'checks' in legacy || 'scholStatus' in legacy || 'custom' in legacy || 'apps' in legacy
  if (!looksLegacy) return null

  const checks: Record<string, boolean> = {}
  for (const [id, done] of Object.entries(legacy.checks ?? {})) {
    if (done === true) checks[id] = true
  }

  const statuses = Object.fromEntries([
    ...statusEntries('cert', legacy.certStatus),
    ...statusEntries('project', legacy.projStatus),
    ...statusEntries('scholarship', legacy.scholStatus),
    ...statusEntries('internship', legacy.internStatus),
    ...statusEntries('job', legacy.jobStatus),
  ])

  const applications: CareerApplication[] = (legacy.apps ?? [])
    .filter((a) => a && (a.company || a.role))
    .map((a) => ({
      id: uid(),
      company: a.company ?? '',
      role: a.role ?? '',
      ...(a.date ? { appliedOn: a.date } : {}),
      status: a.status ?? 'applied',
      ...(a.notes ? { notes: a.notes } : {}),
    }))

  const todos: Todo[] = (legacy.custom ?? [])
    .filter((t) => t && t.text)
    .map((t) => ({
      id: uid(),
      title: t.text as string,
      ...(t.meta ? { notes: t.meta } : {}),
      priority: PRIORITY_MAP[t.priority ?? ''] ?? 'medium',
      category: 'career' as const,
      tags: ['imported'],
      createdAt: Date.now(),
      ...(t.done ? { completedAt: Date.now() } : {}),
    }))

  const summary = `Imported ${Object.keys(checks).length} checklist marks, ${
    Object.keys(statuses).length
  } statuses, ${applications.length} applications, ${todos.length} custom tasks (as career todos).`

  return { career: { checks, statuses, applications }, todos, summary }
}
