import { Select } from '@/components/ui/Select'
import { useAppStore } from '@/lib/storage/store'
import type { BadgeVariant } from '@/components/ui/Badge'

export type StatusKind = 'cert' | 'project' | 'scholarship' | 'internship' | 'job'

export const STATUS_OPTIONS: Record<StatusKind, string[]> = {
  cert: ['not_started', 'studying', 'scheduled', 'completed', 'skipped'],
  project: ['not_started', 'in_progress', 'deployed'],
  scholarship: ['not_started', 'in_progress', 'submitted', 'awarded', 'declined', 'ineligible'],
  internship: ['not_started', 'in_progress', 'submitted', 'awarded', 'declined', 'ineligible'],
  job: ['interested', 'applied', 'interviewing', 'offer', 'rejected', 'closed'],
}

export const APPLICATION_STATUSES = ['applied', 'interviewing', 'offer', 'rejected', 'ghosted']
export const CONTACT_STATUSES = ['not_contacted', 'sent', 'connected', 'no_response']

export function labelize(s: string): string {
  const spaced = s.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  critical: 'danger',
  urgent: 'danger',
  high: 'warning',
  medium: 'accent',
  low: 'neutral',
  ongoing: 'neutral',
}

export const TIER_LABEL: Record<string, string> = {
  federal: 'Federal',
  nj_state: 'NJ State',
  mccc: 'MCCC Foundation',
  national: 'National',
  identity_black: 'Black Heritage',
  identity_hispanic: 'Latino Heritage',
  stem: 'STEM & Defense',
}

export const INTERN_CAT_LABEL: Record<string, string> = {
  federal_gov: 'Federal & Intelligence',
  stem_research: 'STEM Research',
  tech_early: 'Early-Career Tech',
  civic_tech: 'Civic & Gov-Tech',
  defense_contractor: 'Defense Contractors',
}

export const JOB_CAT_LABEL: Record<string, string> = {
  dod: 'DoD & Federal',
  pipeline: 'Pipeline',
  backend: 'Backend',
  analytics: 'Analytics',
}

export function StatusSelect({ kind, id }: { kind: StatusKind; id: string }) {
  const key = `${kind}:${id}`
  const value = useAppStore((s) => s.career.statuses[key]) ?? STATUS_OPTIONS[kind][0]
  const setCareerStatus = useAppStore((s) => s.setCareerStatus)
  return (
    <Select
      value={value}
      onChange={(e) => setCareerStatus(key, e.target.value)}
      aria-label={`Status for ${id}`}
      className="shrink-0"
    >
      {STATUS_OPTIONS[kind].map((o) => (
        <option key={o} value={o}>
          {labelize(o)}
        </option>
      ))}
    </Select>
  )
}

export function ExternalA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-medium text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </a>
  )
}
